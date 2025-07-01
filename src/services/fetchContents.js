import RNFS from 'react-native-fs';
import axios from 'axios';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const fileId = '18HORC8jkbzoxJeyt7XZLdVRxsgErYtoo';
const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
const cachePath = `${RNFS.CachesDirectoryPath}/sample.pdf`;

const apiKey =
  'mikageshan@gmail.com_c0ThkPp475DMSMmwjn9c6wBDV2TR7DyIZLAuEuR8Lxbum6iKNhpyydAit38Nbwq9';

const downloadPDF = async () => {
  const result = await RNFS.downloadFile({
    fromUrl: downloadUrl,
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
          'x-api-key': apiKey,
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
          'x-api-key': apiKey,
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

const cachedText = async text => {
  try {
    await AsyncStorage.setItem('cached_text', text);
    console.log('Teks disimpan ke cache');
  } catch (error) {
    console.error('Gagal simpan teks:', error);
  }
};

const getCachedText = async () => {
  try {
    const text = await AsyncStorage.getItem('cached_text');
    return text;
  } catch (error) {
    console.error('Error fetching cache:', error);
    return null;
  }
};

export const fetchContents = async () => {
  try {
    const cached = await getCachedText();
    if (cached) {
      console.log('Fetching from cache:', cached);
      return cached;
    }

    const filePath = await downloadPDF();
    const uploadedUrl = await uploadPDFtoPDFco(filePath);
    if (!uploadedUrl) return null;

    const parsedText = await convertPDFUrlToText(uploadedUrl);
    if (!parsedText) return null;

    await cachedText(parsedText);
    console.log('Parsing sukses:', parsedText);
    return parsedText;
  } catch (err) {
    console.error('Kesalahan proses:', err.message || err);
    return null;
  }
};
