import axios from 'axios';
import { GROQ_API_KEY, GROQ_API_URL, GROQ_MODEL } from '../config/aiConfig';
import { fetchContents } from './fetchContents';

// AI Context
const SYSTEM_PROMPT = {
  role: 'system',
  content:
    'You are an AI Insurance Assistant. You will answer user questions based on the insurance-related documents provided. If the document includes the question and the answer, use it. If not found, say sorry. Don’t guess if the information isn’t there.',
};

export const sendAIMessage = async userQuestion => {
  try {
    const documentText = await fetchContents();
    if (!documentText) {
      throw new Error('Error fetching document contents');
    }

    const userPrompt = {
      role: 'user',
      content: `Berdasarkan informasi yang saya dapatkan dari database perusahaan:\n\n"""${documentText}"""\n\nPertanyaan saya:\n${userQuestion}\n\nTolong jawab sesuai dengan pertanyaan yang dilempar oleh user.`,
    };

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [SYSTEM_PROMPT, userPrompt],
        temperature: 0.2,
        max_tokens: 1024,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
      },
    );

    const aiMessage = response.data?.choices?.[0]?.message?.content;
    return aiMessage || 'No answer from AI.';
  } catch (error) {
    console.error(
      'Error while sending to AI:',
      error.response?.data || error.message,
    );
    return 'Theres an error while sending to AI.';
  }
};
