import axios from 'axios';
import { OPENROUTER_API_KEY } from '../config.js';

/**
 * openRouterChat(prompt) -> returns string reply (falls back to error string)
 */
export async function openRouterChat(prompt) {
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
  try {
    const res = await axios.post(
      endpoint,
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are BloodEclipse-AI: a savage, witty gamer persona. Keep answers concise and sarcastic.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 512
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`
        },
        timeout: 20000
      }
    );

    return res.data?.choices?.[0]?.message?.content || '🤖 AI failed to answer.';
  } catch (err) {
    console.error('OpenRouter API error:', err.response?.data || err.message);
    return '🤖 AI error. Try again later.';
  }
}
