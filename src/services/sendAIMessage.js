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

Jawaban harus dimulai dengan kalimat: "Menurut info dari data perusahaan, ..."

Jika jawabannya tidak ditemukan dalam dokumen, cukup katakan tidak ada jawabannya.`,
  },
];

const getUserQuestion = messages => {
  return messages.find(msg => msg.role === 'user')?.content || null;
};

const isFollowUpQuestion = (keywords, contextTitle) => {
  if (!contextTitle) return false;
  return keywords.some(word => contextTitle.toLowerCase().includes(word));
};

const fetchMatchingDocument = async question => {
  const listResponse = await axios.get(LIST_JSON_URL);
  const documentList = listResponse.data;

  const cacheTexts = {};
  for (const item of documentList) {
    const cached = await getCachedText(item.title);
    if (cached) cacheTexts[item.title] = cached;
  }

  const bestMatch = matchList(question, documentList, cacheTexts);
  if (!bestMatch) return null;

  const parsedText =
    cacheTexts[bestMatch.title] ||
    (await fetchContents(bestMatch.url, bestMatch.title));

  if (!parsedText) return null;

  return {
    title: bestMatch.title,
    url: bestMatch.url,
    parsedText,
  };
};

export const sendAIMessage = async messages => {
  try {
    const question = getUserQuestion(messages);
    if (!question) throw new Error('[AI] User message not found');

    const keywords = extractKeywords(question);
    let matchedDoc;

    // cek apakah follow up question
    const isFollowUp = isFollowUpQuestion(keywords, lastContext.title);

    if (isFollowUp) {
      console.log(`🔁 [AI] Using previous context: ${lastContext.title}`);
      matchedDoc = lastContext;
    } else {
      matchedDoc = await fetchMatchingDocument(question, keywords);
      if (!matchedDoc)
        return 'Maaf, tidak ditemukan dokumen yang relevan atau dokumen gagal diproses.';

      lastContext = matchedDoc;
      console.log(`✅ [AI] New match: ${matchedDoc.title}`);
    }

    // respon ai
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
