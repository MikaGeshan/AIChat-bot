import axios from 'axios';
import { GITHUB_URL, EXCLUDE_FILES } from '../config/githubConfig';

export async function fetchContents() {
  try {
    const { data } = await axios.get(GITHUB_URL);

    if (!Array.isArray(data)) {
      console.error('Unexpected response from GitHub. Expected an array.');
      return [];
    }

    // Filter file
    let filtered = data.filter(file => {
      return file.download_url && !EXCLUDE_FILES.includes(file.name);
    });

    filtered = filtered.sort((a, b) => {
      const aIsTxt = a.name.endsWith('.txt') ? -1 : 1;
      const bIsTxt = b.name.endsWith('.txt') ? -1 : 1;
      return aIsTxt - bIsTxt;
    });

    console.log(
      'Filtered files to fetch:',
      filtered.map(f => f.name),
    );

    const contents = await Promise.all(
      filtered.map(async file => {
        try {
          const res = await axios.get(file.download_url);
          return {
            name: file.name,
            content: res.data,
          };
        } catch (err) {
          console.error(`Error fetching ${file.name}:`, err.message);
          return {
            name: file.name,
            content: '[Gagal membaca isi file]',
          };
        }
      }),
    );

    return contents;
  } catch (error) {
    console.error('Error fetching documents:', error.message);
    return [];
  }
}
