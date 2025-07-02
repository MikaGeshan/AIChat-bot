import axios from 'axios';
import { GROQ_API_KEY, GROQ_API_URL, GROQ_MODEL } from '../config/aiConfig';
import { LIST_JSON_URL } from '../config/githubConfig';
import { fetchContents, getCachedText } from './fetchContents';
import { getExpandedKeywords, matchList } from './matchList';
import { detectLanguage } from './detectLanguage';

let lastContext = { title: null, url: null, parsedText: null };

const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are an AI Insurance Assistant. You answer user questions based solely on the provided insurance-related documents. 

If the document contains relevant information, use it to construct your answer. If not, simply say the answer is not available.

The document may be written in Indonesian. If the user's question is in English, translate relevant parts from the document and respond in English. If the user's question is in Indonesian, respond in Indonesian. Do not guess or fabricate information.`,
};

const buildFinalMessages = (parsedText, question) => {
  const lang = detectLanguage(question);

  const userPrompt =
    lang === 'en'
      ? `
I have the following document containing important information:

${parsedText}

Based on the document above, please help answer this question:
"${question}"

The answer must begin with: "According to the company data, ..."

If the answer is not found in the document, just say there's no answer available.`
      : `
Saya memiliki dokumen berikut yang berisi informasi penting:

${parsedText}

Berdasarkan dokumen di atas, mohon bantu jawab pertanyaan ini:
"${question}"

Jawaban harus dimulai dengan kalimat: "Menurut info dari data perusahaan, ..."

Jika jawabannya tidak ditemukan dalam dokumen, cukup katakan tidak ada jawabannya.`;

  return [
    SYSTEM_PROMPT,
    {
      role: 'user',
      content: userPrompt.trim(),
    },
  ];
};

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

    const lang = detectLanguage(question);
    const keywords = getExpandedKeywords(question, lang);

    let matchedDoc;

    // cek apakah follow up
    const isFollowUp = isFollowUpQuestion(keywords, lastContext?.title);

    if (isFollowUp) {
      console.log(`[AI] Using previous context: ${lastContext.title}`);
      matchedDoc = lastContext;
    } else {
      matchedDoc = await fetchMatchingDocument(question, keywords);

      if (!matchedDoc) {
        return lang === 'en'
          ? 'Sorry, no relevant document found. Please contact our agent for further assistance.'
          : 'Maaf, dokumen yang relevan tidak ditemukan. Silakan hubungi agen kami untuk bantuan lebih lanjut.';
      }

      lastContext = matchedDoc;
      console.log(`[AI] New match: ${matchedDoc.title}`);
    }

    // Kirim ke AI
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
    return (
      reply ||
      (lang === 'en'
        ? 'Sorry, AI could not answer the question.'
        : 'Maaf, AI tidak bisa menjawab pertanyaannya.')
    );
  } catch (err) {
    console.error('[AI ERROR]', err.message || err);
    return 'There was a problem while processing your question.';
  }
};
