import { fetchContents } from './fetchContents';

// Stopwords untuk penyaringan keyword
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

const extractKeywords = text => {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.has(word));
};

export const matchList = async (question, list) => {
  const keywords = extractKeywords(question);
  let bestMatch = null;
  let highestScore = 0;

  for (const item of list) {
    const title = item.title.toLowerCase();
    const titleMatchCount = keywords.filter(word =>
      title.includes(word),
    ).length;
    const titleScore = titleMatchCount / keywords.length;

    if (titleScore > 0.4) {
      console.log(`📌 Match found by title: ${item.title}`);
      return { ...item, score: titleScore, reason: 'title' };
    }

    // Coba baca isi dokumen dan cocokkan keyword
    const parsed = await fetchContents(item.url, item.title);
    if (!parsed) continue;

    const body = parsed.toLowerCase();
    const bodyMatchCount = keywords.filter(word => body.includes(word)).length;
    const bodyScore = bodyMatchCount / keywords.length;

    console.log(
      `[Match Check] ${item.title}: titleScore=${titleScore.toFixed(
        2,
      )}, bodyScore=${bodyScore.toFixed(2)}`,
    );

    if (bodyScore > highestScore) {
      bestMatch = {
        ...item,
        parsedText: parsed,
        score: bodyScore,
        reason: 'body',
      };
      highestScore = bodyScore;
    }
  }

  return highestScore > 0.2 ? bestMatch : null;
};
