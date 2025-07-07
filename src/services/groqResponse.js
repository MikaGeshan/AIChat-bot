import axios from 'axios';
import { GROQ_API_KEY, GROQ_URL, GROQ_MODEL } from '@env';
import { convertDocument, getFolderContents } from './documentProcess';

const getDocURL = async (userMessage, documents) => {
  try {
    const SYSTEM_PROMPT = `
Berikut ini adalah daftar dokumen dalam format JSON:
${JSON.stringify(documents)}

Tugasmu:
1. Pilih hanya satu dokumen yang paling relevan dengan pertanyaan user.
2. Keluarkan hanya URL dari dokumen tersebut. Jangan beri penjelasan atau tambahan lain.
`;

    const response = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
      },
    );

    const selectedUrl = response.data?.choices?.[0]?.message?.content?.trim();
    if (!selectedUrl?.startsWith('http')) {
      throw new Error('No valid URL from AI');
    }
    return selectedUrl;
  } catch (error) {
    console.error(
      'Error picking relevant document:',
      error?.response?.data || error.message,
    );
    return null;
  }
};

const cachedDocument = {};

export const groqResponse = async userMessage => {
  try {
    const documents = await getFolderContents();
    if (!Array.isArray(documents) || documents.length === 0) {
      return 'Tidak ada dokumen yang tersedia.';
    }

    const folderNames = [...new Set(documents.map(doc => doc.folder))];
    const lowerMsg = userMessage.toLowerCase();

    const folderGuess = folderNames.find(folder =>
      lowerMsg.includes(folder.toLowerCase()),
    );

    const filteredDocs = folderGuess
      ? documents.filter(doc => doc.folder === folderGuess)
      : documents;

    const selectedUrl = await getDocURL(userMessage, filteredDocs);
    if (!selectedUrl) return 'Gagal menemukan dokumen yang relevan.';

    let textContent = cachedDocument[selectedUrl];
    if (!textContent) {
      textContent = await convertDocument(selectedUrl);
      if (!textContent) return 'Gagal memproses isi dokumen.';
      cachedDocument[selectedUrl] = textContent;
    }

    const finalPrompt = `
Berikut ini adalah isi dokumen asuransi yang relevan:
---
${textContent}
---

Pertanyaan user:
"${userMessage}"

Jawablah pertanyaan tersebut secara langsung, spesifik, dan hanya berdasarkan dokumen di atas.
Jika jawabannya tidak ditemukan dalam dokumen, katakan "Informasi tidak tersedia dalam dokumen."
Jangan berimajinasi atau menambahkan informasi dari luar dokumen.
`;

    const response = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'Kamu adalah asisten cerdas khusus dokumen asuransi. Tugasmu adalah membantu menjawab pertanyaan pengguna hanya berdasarkan isi dokumen asuransi yang diberikan.',
          },
          { role: 'user', content: finalPrompt },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
      },
    );

    const finalAnswer = response.data?.choices?.[0]?.message?.content?.trim();
    return finalAnswer || 'No answer from documents.';
  } catch (error) {
    console.error('Groq Response error:', error.message);
    return 'Theres something error with the AI.';
  }
};
