import axios from 'axios';
import { MODELSLAB_API_KEY } from '../config.js';

/**
 * generateImage(prompt) -> returns image URL or null
 */
export async function generateImage(prompt) {
  const url = 'https://modelslab.com/api/v6/images/text2img';
  try {
    const payload = {
      key: MODELSLAB_API_KEY,
      prompt,
      model_id: 'flux',
      width: 512,
      height: 512,
      samples: 1,
      num_inference_steps: 25,
      guidance_scale: 7.5
    };

    const res = await axios.post(url, payload, { timeout: 60000 });
    if (res.data?.output && res.data.output[0]) return res.data.output[0];
    console.error('ModelsLab returned unexpected body:', res.data);
    return null;
  } catch (err) {
    console.error('ModelsLab error:', err.response?.data || err.message);
    return null;
  }
}
