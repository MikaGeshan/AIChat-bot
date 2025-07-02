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

  if (keywords.length === 0) {
    console.warn('[Match] Tidak ada keyword yang valid ditemukan.');
    return null;
  }

  const scoredItems = list.map(item => {
    const title = item.title.toLowerCase();
    const body = cacheTexts[item.title]?.toLowerCase() || '';

    const titleMatches = keywords.filter(w => title.includes(w)).length;
    const bodyMatches = keywords.filter(w => body.includes(w)).length;

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

    return {
      item,
      finalScore,
    };
  });

  const sorted = scoredItems
    .filter(s => s.finalScore > 0)
    .sort((a, b) => b.finalScore - a.finalScore);

  const best = sorted[0];

  return best?.finalScore > 0.1 ? best.item : null;
};
