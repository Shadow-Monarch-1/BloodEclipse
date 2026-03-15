import axios from 'axios';
import { GOOGLE_API_KEY, GOOGLE_CSE_ID } from '../config.js';

/**
 * googleSearch(query) -> returns array [{title, link}] (top 3)
 */
export async function googleSearch(query) {
  const url = 'https://www.googleapis.com/customsearch/v1';
  try {
    const res = await axios.get(url, {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CSE_ID,
        q: query,
        num: 3
      },
      timeout: 10_000
    });

    const items = res.data?.items || [];
    return items.slice(0, 3).map(i => ({ title: i.title, link: i.link }));
  } catch (err) {
    console.error('Google Search error:', err.response?.data || err.message);
    return [];
  }
}
