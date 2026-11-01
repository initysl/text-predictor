// Tokens that attach to the previous word with no space before them
const ATTACH = /^([,.;:!?)\]%]|'s|n't|'re|'ve|'ll|'d|'m|-)$/i;
// Tokens the next word attaches to with no space after them
const OPENERS = /^[-([]$/;

export const isPunctuation = (word: string) => /^[^\p{L}\p{N}]+$/u.test(word);

/** Split `text` into the part kept and the separator to put before `word` */
function join(text: string, word: string) {
  if (ATTACH.test(word)) return { base: text.trimEnd(), sep: '' };
  if (!text || /\s$/.test(text) || OPENERS.test(text.slice(-1))) return { base: text, sep: '' };
  return { base: text, sep: ' ' };
}

/** Insert a predicted token with natural spacing, leaving the caret ready for the next word */
export function applyPrediction(text: string, word: string): string {
  const { base, sep } = join(text, word);
  const trailing = OPENERS.test(word) ? '' : ' ';
  return base + sep + word + trailing;
}

/** The faded text shown after the caret for a prediction */
export function ghostSuffix(text: string, word: string): string {
  const { base, sep } = join(text, word);
  // An attached token after a trailing space replaces the space; show the token alone
  return base === text ? sep + word : word;
}

export const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;
