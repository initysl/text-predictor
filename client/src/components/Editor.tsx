import React, { useLayoutEffect, useRef, useState } from 'react';
import { LuEraser } from 'react-icons/lu';
import { countWords, ghostSuffix } from '../lib/text';
import Kbd from './Kbd';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onAccept: (index: number) => void;
  onClear: () => void;
  /** Top prediction for exactly the current text, if any */
  topWord: string | null;
  suggestionCount: number;
  /** Bumped by the parent to refocus after a programmatic edit */
  focusKey: number;
  children?: React.ReactNode;
}

const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  onAccept,
  onClear,
  topWord,
  suggestionCount,
  focusKey,
  children,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mirrorRef = useRef<HTMLDivElement | null>(null);
  const [caretAtEnd, setCaretAtEnd] = useState(true);
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);

  const ghost =
    topWord && caretAtEnd && dismissedFor !== value ? ghostSuffix(value, topWord) : '';

  // Grow with content instead of scrolling, so the ghost mirror never needs scroll sync
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, mirrorRef.current?.scrollHeight ?? 0)}px`;
  }, [value, ghost]);

  // After an accept or clear, return focus with the caret at the end
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el || focusKey === 0) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
    setCaretAtEnd(true);
  }, [focusKey]);

  const syncCaret = () => {
    const el = textareaRef.current;
    if (el) setCaretAtEnd(el.selectionStart === el.selectionEnd && el.selectionEnd === el.value.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && !e.shiftKey && ghost) {
      e.preventDefault();
      onAccept(0);
      return;
    }
    // e.code, since Option+digit types a symbol on macOS
    const digit = /^Digit([1-9])$/.exec(e.code);
    if (e.altKey && digit && Number(digit[1]) <= suggestionCount) {
      e.preventDefault();
      onAccept(Number(digit[1]) - 1);
      return;
    }
    if (e.key === 'Escape' && ghost) {
      e.preventDefault();
      setDismissedFor(value);
    }
  };

  const words = countWords(value);

  return (
    <section className='rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)] transition-shadow focus-within:border-accent/40 focus-within:shadow-[0_0_0_4px_var(--accent-soft)]'>
      <div className='relative'>
        <div
          ref={mirrorRef}
          aria-hidden
          className='editor-text pointer-events-none absolute inset-0 overflow-hidden text-transparent'
        >
          {value}
          <span className='text-ghost'>{ghost}</span>
          {ghost && (
            <span className='ml-2 inline-block translate-y-[-2px] align-middle'>
              <Kbd>Tab</Kbd>
            </span>
          )}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            syncCaret();
          }}
          onKeyDown={handleKeyDown}
          onSelect={syncCaret}
          onBlur={() => setCaretAtEnd(false)}
          onFocus={syncCaret}
          placeholder={ghost ? '' : 'Start typing…'}
          aria-label='Your text'
          aria-describedby='editor-hints'
          autoFocus
          spellCheck
          rows={4}
          className='editor-text relative block min-h-[8rem] sm:min-h-[11rem] w-full resize-none overflow-hidden bg-transparent text-fg caret-accent outline-none placeholder:text-fg-3 focus-visible:outline-none'
        />
      </div>

      {children}

      <div className='flex items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-xs text-fg-3 sm:px-6'>
        <span className='font-mono tabular-nums'>
          {words} {words === 1 ? 'word' : 'words'} · {value.length} chars
        </span>
        <div className='flex items-center gap-4'>
          <span id='editor-hints' className='hidden items-center gap-1.5 sm:flex'>
            <Kbd>Tab</Kbd> accept
            <span className='mx-1 text-line'>|</span>
            <Kbd>⌥ 1–5</Kbd> pick
            <span className='mx-1 text-line'>|</span>
            <Kbd>Esc</Kbd> hide
          </span>
          <button
            type='button'
            onClick={onClear}
            disabled={!value}
            className='flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg disabled:pointer-events-none disabled:opacity-40'
          >
            <LuEraser className='size-3.5' aria-hidden />
            Clear
          </button>
        </div>
      </div>
    </section>
  );
};

export default Editor;
