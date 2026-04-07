import streamlit as st
import pickle
import sys

sys.path.append('..')
from src.predict import TextPredictor



st.set_page_config(
    page_title="Smart Text Predictor",
    page_icon="⌨️",
    layout="wide"
)


# Styling
st.markdown("""
<style>
textarea {
    font-size: 18px !important;
    line-height: 1.6;
}

.ghost-text {
    position: absolute;
    top: 12px;
    left: 12px;
    color: #999;
    pointer-events: none;
    font-size: 20px;
}

.suggestion-chip button {
    border-radius: 30px !important;
    padding: 10px !important;
    font-weight: 600;
}

.metric-card {
    background: #f5f7fa;
    padding: 15px;
    border-radius: 10px;
    text-align: center;
}
</style>
""", unsafe_allow_html=True)



# Load model
@st.cache_resource
def load_predictor():
    return TextPredictor(model_dir='../models')



# Session state
def init_state():
    if "text" not in st.session_state:
        st.session_state.text = ""
    if "text_area" not in st.session_state:
        st.session_state.text_area = ""
    if "predictions_made" not in st.session_state:
        st.session_state.predictions_made = 0
    if "top1_accepted" not in st.session_state:
        st.session_state.top1_accepted = 0


def add_word(word):
    if st.session_state.text:
        st.session_state.text += " " + word
    else:
        st.session_state.text = word

    st.session_state.text_area = st.session_state.text
    st.session_state.predictions_made += 1



# Helper: Get inline suggestion (ghost text)
def get_inline_suggestion(text, predictor):
    if not text.strip():
        return ""

    result = predictor.predict_with_context(text, top_k=1)
    preds = result["predictions"]

    if not preds:
        return ""

    suggestion = preds[0][0]

    # Only show suggestion if last word incomplete
    last_word = text.split()[-1] if text.split() else ""

    if suggestion.startswith(last_word):
        return suggestion[len(last_word):]

    return suggestion


# Handle real-time update
def on_text_change():
    st.session_state.text = st.session_state.text_area


# Main app
def main():
    init_state()
    predictor = load_predictor()

    st.title("⌨️ Smart Text Predictor")
    st.caption("Real-time ML N-gram language model system")

    st.divider()

    st.subheader("Start typing")

    col_main, col_side = st.columns([3, 1])

    with col_main:
        user_text = st.text_area(
            "",
            value=st.session_state.text,
            height=140,
            key="text_area",
            placeholder="Type something like: The future of artificial",
            on_change=on_text_change
        )

        # Inline autocomplete (ghost text)
        inline = get_inline_suggestion(st.session_state.text, predictor)

        # if inline:
        #     st.markdown(
        #         f"<div class='ghost-text'>{inline}</div>",
        #         unsafe_allow_html=True
        #     )



    # Horizontal (Suggestion chips)
    if st.session_state.get("text", "").strip():
        result = predictor.predict_with_context(
            st.session_state.text,
            top_k=5
        )

        preds = result["predictions"]
        fallback = result["fallback_used"]

        st.markdown("### Suggestions")
        st.caption(f"Model: {fallback.upper()}")

        cols = st.columns(len(preds))

        for i, ((word, prob), col) in enumerate(zip(preds, cols)):
            with col:
                if st.button(
                    f"{word}\n{prob:.0%}",
                    key=f"chip_{i}_{st.session_state.predictions_made}",
                    use_container_width=True
                ):
                    add_word(word)

                    if i == 0:
                        st.session_state.top1_accepted += 1

                    st.rerun()

        # Confidence bars
        for word, prob in preds:
            st.progress(prob, text=f"{word} ({prob:.1%})")

    
    # Actions
    col1, col2 = st.columns(2)

    with col1:
        if st.button("Clear Text"):
            st.session_state.text = ""
            st.session_state.text_area = ""
            st.rerun()

    with col2:
        st.download_button(
            "Download Text",
            data=st.session_state.text,
            file_name="text.txt"
        )

    
    # Stats
    st.divider()
    st.subheader("Session Statistics")

    c1, c2, c3 = st.columns(3)

    c1.metric("Predictions", st.session_state.predictions_made)
    c2.metric("Top Accepted", st.session_state.top1_accepted)

    acc = (
        st.session_state.top1_accepted /
        st.session_state.predictions_made * 100
        if st.session_state.predictions_made else 0
    )

    c3.metric("Accuracy", f"{acc:.1f}%")

    
    # Sidebar
    with st.sidebar:
        st.header("Model Info")

        try:
            with open('../models/trigram_model.pkl', 'rb') as f:
                trig = pickle.load(f)

            with open('../models/bigram_model.pkl', 'rb') as f:
                bi = pickle.load(f)

            st.metric("Trigrams", f"{len(trig):,}")
            st.metric("Bigrams", f"{len(bi):,}")

        except:
            st.error("Model not loaded")

        st.divider()

        if st.button("Reset Stats"):
            st.session_state.predictions_made = 0
            st.session_state.top1_accepted = 0
            st.rerun()


if __name__ == "__main__":
    main()