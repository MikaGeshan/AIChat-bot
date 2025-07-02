import {
  detectLanguage,
  stopwordsByLang,
  synonymMapByLang,
} from './detectLanguage';

export const getExpandedKeywords = (text, lang = 'id') => {
  const stopwords = stopwordsByLang[lang] || new Set();
  const synonymMap = synonymMapByLang[lang] || {};

  const baseKeywords = text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.has(word));

  const expanded = new Set(baseKeywords);

  for (const word of baseKeywords) {
    if (synonymMap[word]) {
      synonymMap[word].forEach(syn => expanded.add(syn));
    }
  }

  return Array.from(expanded);
};

export const matchList = (question, list, cacheTexts = {}) => {
  const lang = detectLanguage(question);
  const keywords = getExpandedKeywords(question, lang);

  if (keywords.length === 0) {
    console.warn('[Match] Tidak ada keyword yang valid ditemukan.');
    return null;
  }

  const scoredItems = list.map(item => {
    const titleText = item.title.toLowerCase();
    const bodyText = (cacheTexts[item.title] || '').toLowerCase();

    const countMatches = (text, words) =>
      words.filter(word => text.includes(word)).length;

    const titleMatches = countMatches(titleText, keywords);
    const bodyMatches = countMatches(bodyText, keywords);

    const titleScore = titleMatches / keywords.length;
    const bodyScore = bodyMatches / keywords.length;
    const finalScore = titleScore * 2 + bodyScore;

    console.log(
      `[Match Check] ${item.title}: titleScore=${titleScore.toFixed(
        2,
      )}, bodyScore=${bodyScore.toFixed(2)}, finalScore=${finalScore.toFixed(
        2,
      )}`,
    );

    return { item, finalScore };
  });

  const sorted = scoredItems
    .filter(score => score.finalScore > 0)
    .sort((a, b) => b.finalScore - a.finalScore);

  const bestMatch = sorted[0];
  return bestMatch?.finalScore > 0.1 ? bestMatch.item : null;
};
