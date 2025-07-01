import RNFS from 'react-native-fs';
import axios from 'axios';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PDFCO_APIKEY } from '../config/folderConfig';

const generateCacheKey = title => `cached_text_${title}`;

const log = (label, message) => {
  console.log(`[${label}] ${message}`);
};

const logError = (label, error) => {
  console.error(`[${label}]`, error.response?.data || error.message || error);
};

// Cache handling
const getCachedText = async title => {
  try {
    const key = generateCacheKey(title);
    const cached = await AsyncStorage.getItem(key);
    return cached;
  } catch (err) {
    logError('Cache Read', err);
    return null;
  }
};

const saveCachedText = async (title, text) => {
  try {
    const key = generateCacheKey(title);
    await AsyncStorage.setItem(key, text);
    log('Cache Write', `Saved text to ${key}`);
  } catch (err) {
    logError('Cache Write', err);
  }
};

// Download file from url
const downloadPDF = async (url, filename = 'document.pdf') => {
  const filePath = `${RNFS.CachesDirectoryPath}/${filename}`;

  const result = await RNFS.downloadFile({ fromUrl: url, toFile: filePath })
    .promise;

  if (result.statusCode === 200) {
    log('Download', `Success: ${filePath}`);
    return filePath;
  } else {
    throw new Error(`Download failed with status ${result.statusCode}`);
  }
};

// upload pdf to parse
const uploadPDF = async filePath => {
  try {
    const fileName = 'upload.pdf';

    const { data } = await axios.get(
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

    const { presignedUrl, url } = data;

    const base64File = await RNFS.readFile(filePath, 'base64');
    await axios.put(presignedUrl, Buffer.from(base64File, 'base64'), {
      headers: { 'Content-Type': 'application/pdf' },
    });

    return url;
  } catch (err) {
    logError('Upload PDF', err);
    return null;
  }
};

const convertPDFToText = async pdfUrl => {
  try {
    const { data } = await axios.post(
      'https://api.pdf.co/v1/pdf/convert/to/text',
      { url: pdfUrl, inline: true },
      {
        headers: {
          'x-api-key': PDFCO_APIKEY,
          'Content-Type': 'application/json',
        },
      },
    );

    if (data.error) throw new Error(data.message);

    return data.body;
  } catch (err) {
    logError('Convert PDF', err);
    return null;
  }
};

// fetching all content
export const fetchContents = async (url, title = 'default') => {
  log('Fetch', `fetchContents called for: ${title}`);

  try {
    // checking cache
    const cached = await getCachedText(title);
    if (cached && cached.trim().length > 50) {
      log('Fetch', `Fetched from cache: ${title}`);
      return cached;
    }

    // download pdf
    const filePath = await downloadPDF(url, `${title}.pdf`);

    // upload pdf
    const uploadedUrl = await uploadPDF(filePath);
    if (!uploadedUrl) {
      log('Fetch', `Upload gagal untuk: ${title}`);
      return null;
    }

    // parse pdf to text
    const parsedText = await convertPDFToText(uploadedUrl);
    if (!parsedText || parsedText.trim().length < 50) {
      log('Fetch', `Parsing gagal atau hasil kosong: ${title}`);
      return null;
    }

    // save to cache
    await saveCachedText(title, parsedText);
    log('Fetch', `Parsed & cached: ${title}`);

    return parsedText;
  } catch (err) {
    logError(`FetchContents(${title})`, err);
    return null;
  }
};

export { getCachedText };
