import axios from 'axios';
import { FOLDER_ID } from '../config/drive';
import {
  GOOGLE_CONVERT_SCRIPT,
  GOOGLE_JSON_SCRIPT,
} from '../config/google_script';

export const getFolderContents = async () => {
  try {
    const url = `${GOOGLE_JSON_SCRIPT}?folderId=${FOLDER_ID}`;
    console.log('Fetching folder contents from:', url);
    const response = await axios.get(url);
    console.log('Folder contents response:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      'Failed to fetch drive contents',
      error?.response?.data || error.message,
    );
  }
};

export const convertDocument = async fileUrl => {
  try {
    console.log('Starting PDF document conversion for URL:', fileUrl);

    let fileId = null;

    if (fileUrl.includes('drive.google.com/file/d/')) {
      const match = fileUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
      fileId = match?.[1];
      console.log('Detected Drive file, ID:', fileId);
    } else if (fileUrl.includes('drive.google.com/uc?id=')) {
      const match = fileUrl.match(/uc\?id=([a-zA-Z0-9-_]+)/);
      fileId = match?.[1];
      console.log('Detected download link, ID:', fileId);
    }

    if (!fileId) throw new Error('Invalid Google Drive PDF URL');

    const scriptUrl = `${GOOGLE_CONVERT_SCRIPT}?fileId=${fileId}`;
    console.log('Calling Apps Script at:', scriptUrl);

    const res = await axios.get(scriptUrl);
    console.log('Apps Script response:', res.data);

    return res.data;
  } catch (error) {
    console.error('Apps Script error:', error?.response?.data || error.message);
    return null;
  }
};
