import axios from 'axios';
import { GROQ_API_KEY, GROQ_API_URL, GROQ_MODEL } from '../config/aiConfig';
import { LIST_JSON_URL } from '../config/githubConfig';
import { fetchContents, getCachedText } from './fetchContents';
import { extractKeywords, matchList } from './matchList';

let lastContext = { title: null, url: null, parsedText: null };

const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are an AI Insurance Assistant. You will answer user questions based on the insurance-related documents provided. If the document includes the question and the answer, use it. If not found, say sorry. Don’t guess if the information isn’t there.`,
};

const buildFinalMessages = (parsedText, question) => [
  SYSTEM_PROMPT,
  {
    role: 'user',
    content: `
Saya memiliki dokumen berikut yang berisi informasi penting:

${parsedText}

Berdasarkan dokumen di atas, mohon bantu jawab pertanyaan ini:
"${question}"

Jika jawabannya tidak ditemukan dalam dokumen, cukup katakan tidak ada jawabannya.`,
  },
];

export const sendAIMessage = async messages => {
  try {
    const userMessage = messages.find(msg => msg.role === 'user');
    if (!userMessage) throw new Error('[AI] User message not found');

    const question = userMessage.content;
    const keywords = extractKeywords(question);

    let matchedDoc = null;

    // cek konteks untuk pertanyaan follow up
    const isFollowUp =
      lastContext.title &&
      keywords.some(word => lastContext.title.toLowerCase().includes(word));

    if (isFollowUp) {
      console.log(`🔁 [AI] Using previous context: ${lastContext.title}`);
      matchedDoc = lastContext;
    } else {
      const res = await axios.get(LIST_JSON_URL);
      const list = res.data;

      const cacheTexts = {};
      for (const item of list) {
        const cached = await getCachedText(item.title);
        if (cached) cacheTexts[item.title] = cached;
      }

      const bestMatch = matchList(question, list, cacheTexts);
      if (!bestMatch) return 'Maaf, tidak ditemukan dokumen yang relevan.';

      const parsedText =
        cacheTexts[bestMatch.title] ||
        (await fetchContents(bestMatch.url, bestMatch.title));
      if (!parsedText) return `Gagal memproses dokumen: ${bestMatch.title}`;

      matchedDoc = {
        title: bestMatch.title,
        url: bestMatch.url,
        parsedText,
      };

      lastContext = matchedDoc;
      console.log(`[AI] New match: ${matchedDoc.title}`);
    }

    // ai response
    const response = await axios.post(
      GROQ_API_URL,
      {
        messages: buildFinalMessages(matchedDoc.parsedText, question),
        model: GROQ_MODEL,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const reply = response.data.choices?.[0]?.message?.content?.trim();
    return reply || 'Maaf, AI tidak menemukan jawaban yang sesuai.';
  } catch (err) {
    console.error('[AI ERROR]', err.message || err);
    return 'Terjadi kesalahan saat memproses pertanyaan Anda.';
  }
};
