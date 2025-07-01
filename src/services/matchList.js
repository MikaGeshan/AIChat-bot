export const extractKeywords = text => {
  const stopwords = new Set([
    'apa',
    'yang',
    'untuk',
    'dari',
    'dan',
    'bagaimana',
    'adalah',
    'dengan',
    'di',
    'ke',
    'atau',
    'jika',
    'bisa',
    'saja',
    'sudah',
    'belum',
    'akan',
    'itu',
    'ini',
    'dalam',
    'tentang',
  ]);

  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.has(word));
};

export const matchList = (question, list, cacheTexts = {}) => {
  const keywords = extractKeywords(question);
  let bestMatch = null;
  let bestScore = 0;

  for (const item of list) {
    const titleScore =
      keywords.filter(w => item.title.toLowerCase().includes(w)).length /
      keywords.length;
    const bodyScore = cacheTexts[item.title]
      ? keywords.filter(w => cacheTexts[item.title].toLowerCase().includes(w))
          .length / keywords.length
      : 0;

    console.log(
      `[Match Check] ${item.title}: titleScore=${titleScore.toFixed(
        2,
      )}, bodyScore=${bodyScore.toFixed(2)}`,
    );
    const score = Math.max(titleScore, bodyScore);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestScore > 0.1 ? bestMatch : null;
};
