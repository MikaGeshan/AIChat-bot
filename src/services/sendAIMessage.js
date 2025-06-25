import axios from 'axios';
import { GROQ_API_KEY, GROQ_API_URL, GROQ_MODEL } from '../config/aiConfig';

// Untuk mengatur peran dan pesan awal yang akan dikirim oleh AI
const SYSTEM_PROMPT = {
  role: 'system',
  content:
    'You are an AI Insurance Assistant. You help users with claims, quotes, policy info, and general insurance questions.',
};

// Fungsi untuk mengirim pesan ke AI dan mendapatkan respon
export const sendAIMessage = async messages => {
  try {
    const fullMessages = [SYSTEM_PROMPT, ...messages];
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: fullMessages,
        temperature: 0.7,
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
    return content || 'Maaf, AI tidak memberikan respon.';
  } catch (error) {
    console.error('Groq AI error:', error?.response?.data || error.message);
    return 'Maaf, ada kesalahan saat menghubungi AI.';
  }
};
