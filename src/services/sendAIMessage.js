import axios from 'axios';
import { GROQ_API_KEY, GROQ_API_URL, GROQ_MODEL } from '../config/aiConfig';
import { fetchContents } from './fetchContents';

// AI Context
const SYSTEM_PROMPT = {
  role: 'system',
  content:
    'You are an AI Insurance Assistant. You will answer user questions based on the insurance-related documents provided. If the document includes the question and the answer, use it. If not found, say sorry Don’t guess if the information isn’t there.',
};

export const sendAIMessage = async messages => {
  try {
    // Fetch dokumen dari folder
    const files = await fetchContents();

    const docString = files
      .map(doc => `--- ${doc.name} ---\n${doc.content}`)
      .join('\n\n');

    const userQuestion = messages[messages.length - 1]?.content || '';

    // Respon AI kepada pertanyaan user
    const newMessage = {
      role: 'user',
      content: `Answer the following question based on the reference documents I provide. Do not display or mention the document contents in your answer.\n\nQuestion: "${userQuestion}"\n\nReference documents (for AI only, do not show to user):\n${docString}`,
    };

    const fullMessages = [SYSTEM_PROMPT, newMessage];

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: fullMessages,
        temperature: 0.2,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const content = response?.data?.choices?.[0]?.message?.content;
    return content || 'Sorry, I could not find an answer to your question.';
  } catch (error) {
    console.error('Groq AI error:', error?.response?.data || error.message);
    return 'There was an error processing your request. Please try again later.';
  }
};
