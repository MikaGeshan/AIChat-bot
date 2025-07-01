import axios from 'axios';
import { GROQ_API_KEY, GROQ_API_URL, GROQ_MODEL } from '../config/aiConfig';
import { LIST_JSON_URL } from '../config/githubConfig';
import { fetchContents } from './fetchContents';
import { matchList } from './matchList';

let lastContext = {
  title: null,
  url: null,
  parsedText: null,
};

const SYSTEM_PROMPT = {
  role: 'system',
  content:
    'You are an AI Insurance Assistant. You will answer user questions based on the insurance-related documents provided. If the document includes the question and the answer, use it. If not found, say sorry. Don’t guess if the information isn’t there.',
};

export const sendAIMessage = async messages => {
  try {
    const userMessage = messages.find(msg => msg.role === 'user');
    if (!userMessage) throw new Error('No user message found');

    const question = userMessage.content;

    // cocokin dengan konteks sebelumnya
    const keywords = question.toLowerCase().split(/\s+/);
    const isFollowUp =
      lastContext.title &&
      keywords.some(word => lastContext.title.toLowerCase().includes(word));

    let matchedDoc;

    if (isFollowUp) {
      matchedDoc = lastContext;
      console.log('Using previous context:', matchedDoc.title);
    } else {
      const res = await axios.get(LIST_JSON_URL);
      const list = res.data;

      const bestMatch = await matchList(question, list);
      if (!bestMatch) return 'Sorry, no relevant documents.';

      matchedDoc = {
        title: bestMatch.title,
        url: bestMatch.url,
        parsedText:
          bestMatch.parsedText ||
          (await fetchContents(bestMatch.url, bestMatch.title)),
      };

      lastContext = matchedDoc;
      console.log(
        `New document matched: ${matchedDoc.title} (via ${bestMatch.reason})`,
      );
    }

    const finalMessages = [
      SYSTEM_PROMPT,
      {
        role: 'user',
        content:
          `Saya memiliki dokumen berikut yang berisi informasi penting:\n\n` +
          matchedDoc.parsedText +
          `\n\nBerdasarkan dokumen di atas, mohon bantu jawab pertanyaan ini:\n"${question}"` +
          `\n\nJika jawabannya tidak ditemukan secara eksplisit dalam dokumen, jawab: "Maaf, saya tidak menemukan jawaban dalam dokumen."`,
      },
    ];

    const aiRes = await axios.post(
      GROQ_API_URL,
      {
        messages: finalMessages,
        model: GROQ_MODEL,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return (
      aiRes.data.choices[0]?.message?.content?.trim() ||
      'Sorry no match answer.'
    );
  } catch (err) {
    console.error('sendAIMessage error:', err.message || err);
    return 'Theres something wrong with the AI, try again later.';
  }
};
