from predict import TextPredictor
from colorama import Fore, Style, init


init(autoreset=True)


class TextPredictorCLI:
    """Interactive command-line interface for text prediction"""
    
    def __init__(self):
        """Initialize CLI with predictor"""
        print(Fore.CYAN + "\n🚀 Initializing Text Predictor CLI...")
        self.predictor = TextPredictor()
        self.stats = {
            'total_predictions': 0,
            'top_accepted': 0,
            'custom_typed': 0
        }
        print(Fore.GREEN + "Ready!\n")
    
    def _get_confidence_color(self, probability):
        """Return color based on confidence level"""
        if probability >= 0.5:
            return Fore.GREEN  
        elif probability >= 0.2:
            return Fore.YELLOW 
        else:
            return Fore.RED  
    
    def _display_predictions(self, predictions):
        """Display predictions with colors and bars"""
        print("\n" + Fore.CYAN + "Predictions:")
        print(Fore.CYAN + "-" * 50)
        
        for idx, (word, prob) in enumerate(predictions, 1):
            color = self._get_confidence_color(prob)

            # Create progress bar
            bar_length = int(prob * 30)  # Max 30 characters
            bar = "█" * bar_length + "░" * (30 - bar_length)
            
            # Format output
            print(f"{color}{idx}. {word:15} {bar} {prob:.1%}{Style.RESET_ALL}")
    
    def _display_stats(self):
        """Display session statistics"""
        total = self.stats['total_predictions']
        if total == 0:
            return
        
        accuracy = (self.stats['top_accepted'] / total * 100) if total > 0 else 0
        
        print("\n" + Fore.MAGENTA + "Session Stats:")
        print(Fore.MAGENTA + "-" * 50)
        print(f"Total predictions: {total}")
        print(f"Top suggestion accepted: {self.stats['top_accepted']} ({accuracy:.1f}%)")
        print(f"Custom words typed: {self.stats['custom_typed']}")
    
    def run(self):
        """Main CLI loop"""
        print(Fore.YELLOW + "="*60)
        print(Fore.YELLOW + "        TEXT PREDICTOR - INTERACTIVE MODE")
        print(Fore.YELLOW + "="*60)
        print("\nCommands:")
        print("  • Type text to get predictions")
        print("  • Press 1-5 to select a prediction")
        print("  • Press 'Tab' to accept top prediction")
        print("  • Press 'Enter' to submit and start fresh")
        print("  • Type 'stats' to view statistics")
        print("  • Type 'quit' or 'exit' to quit")
        print("\n" + Fore.YELLOW + "="*60 + "\n")
        
        current_text = ""
        
        while True:
            # Display current text
            if current_text:
                print(Fore.WHITE + f"\nCurrent text: {Style.BRIGHT}{current_text}{Style.RESET_ALL}")
            
            # Get predictions
            predictions = self.predictor.predict(current_text, top_k=5)
            
            if predictions:
                self._display_predictions(predictions)
                self.stats['total_predictions'] += 1
            
            # Get user input
            print(Fore.CYAN + "\nYour input: ", end="")
            user_input = input().strip()
            
            # Handle commands
            if user_input.lower() in ['quit', 'exit', 'q']:
                self._display_stats()
                print(Fore.GREEN + "\nGoodbye!\n")
                break
            
            elif user_input.lower() == 'stats':
                self._display_stats()
                continue
            
            elif user_input.lower() == 'clear':
                current_text = ""
                print(Fore.GREEN + "Text cleared!")
                continue
            
            elif user_input == '':
                # Enter pressed - submit and reset
                if current_text:
                    print(Fore.GREEN + f"\nFinal text: {current_text}")
                    current_text = ""
                    print(Fore.GREEN + "Starting fresh!\n")
                continue
            
            elif user_input in ['1', '2', '3', '4', '5']:
                # Number pressed - select prediction
                idx = int(user_input) - 1
                if idx < len(predictions):
                    selected_word = predictions[idx][0]
                    current_text = f"{current_text} {selected_word}".strip()
                    
                    if idx == 0:  # Top prediction
                        self.stats['top_accepted'] += 1
                    
                    print(Fore.GREEN + f"Added: {selected_word}")
                else:
                    print(Fore.RED + "Invalid selection!")
            
            else:
                # Text typed - add to current text
                current_text = f"{current_text} {user_input}".strip()
                self.stats['custom_typed'] += 1
                print(Fore.GREEN + f"Added: {user_input}")


def main():
    """Run CLI"""
    try:
        cli = TextPredictorCLI()
        cli.run()
    except KeyboardInterrupt:
        print(Fore.YELLOW + "\n\n  Interrupted by user")
        print(Fore.GREEN + " Goodbye!\n")
    except Exception as e:
        print(Fore.RED + f"\n Error: {e}")


if __name__ == "__main__":
    main()