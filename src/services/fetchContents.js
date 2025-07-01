import RNFS from 'react-native-fs';
import axios from 'axios';
import { Buffer } from 'buffer';
import { PDFCO_APIKEY } from '../config/folderConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const downloadPDF = async (url, filename = 'sample.pdf') => {
  const cachePath = `${RNFS.CachesDirectoryPath}/${filename}`;

  const result = await RNFS.downloadFile({
    fromUrl: url,
    toFile: cachePath,
  }).promise;

  if (result.statusCode === 200) {
    console.log('Success Downloaded:', cachePath);
    return cachePath;
  } else {
    throw new Error(`Error downloading: ${result.statusCode}`);
  }
};

const uploadPDFtoPDFco = async filePath => {
  try {
    const fileName = 'sample.pdf';

    const presignRes = await axios.get(
      'https://api.pdf.co/v1/file/upload/get-presigned-url',
      {
        params: {
          name: fileName,
          contenttype: 'application/pdf',
        },
        headers: {
          'x-api-key': PDFCO_APIKEY,
        },
      },
    );

    const { presignedUrl, url } = presignRes.data;
    console.log('Presigned URL:', url);

    const fileData = await RNFS.readFile(filePath, 'base64');
    await axios.put(presignedUrl, Buffer.from(fileData, 'base64'), {
      headers: { 'Content-Type': 'application/pdf' },
    });

    return url;
  } catch (error) {
    console.error(
      'Error uploading to PDF.co:',
      error.response?.data || error.message,
    );
    return null;
  }
};

const convertPDFUrlToText = async pdfUrl => {
  try {
    const response = await axios.post(
      'https://api.pdf.co/v1/pdf/convert/to/text',
      {
        url: pdfUrl,
        inline: true,
      },
      {
        headers: {
          'x-api-key': PDFCO_APIKEY,
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.data.error) {
      throw new Error(response.data.message);
    }

    return response.data.body;
  } catch (error) {
    console.error(
      'Error converting PDF to text:',
      error.response?.data || error.message,
    );
    return null;
  }
};

const generateCacheKey = url => `cached_text_${url}`;

const cachedText = async (url, text) => {
  try {
    const key = generateCacheKey(url);
    await AsyncStorage.setItem(key, text);
    console.log('Text saved to cache:', key);
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

const getCachedText = async url => {
  try {
    const key = generateCacheKey(url);
    const text = await AsyncStorage.getItem(key);
    return text;
  } catch (error) {
    console.error('Error fetching cache:', error);
    return null;
  }
};

export const fetchContents = async (url, title = 'default') => {
  console.log(`🔍 fetchContents called for: ${title}`);
  try {
    // Cek cache
    const cached = await getCachedText(title);
    if (cached && cached.trim().length > 50) {
      console.log(`🟢 Fetched from cache: ${title}`);
      return cached;
    }

    // Kalau tidak ada cache, baru lanjut proses
    console.log(`📥 Downloading PDF for: ${title}`);
    const filePath = await downloadPDF(url);
    console.log(`✅ Success Downloaded: ${filePath}`);

    const uploadedUrl = await uploadPDFtoPDFco(filePath);
    if (!uploadedUrl) {
      console.error(`❌ Gagal upload PDF: ${title}`);
      return null;
    }

    console.log(`🔗 Presigned URL: ${uploadedUrl}`);

    const parsedText = await convertPDFUrlToText(uploadedUrl);
    if (!parsedText || parsedText.trim().length < 50) {
      console.error(`❌ Parsing gagal atau hasil kosong untuk: ${title}`);
      return null;
    }

    // Simpan ke cache
    await cachedText(title, parsedText);
    console.log(`✅ Parsed & cached: ${title}`);
    return parsedText;
  } catch (err) {
    console.error(`🚨 Error fetchContents(${title}):`, err.message || err);
    return null;
  }
};
