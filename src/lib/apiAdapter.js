import { muapi, MuapiClient } from './muapi.js';
import * as kaidolApi from './kaidol_api.js';

function getApiMode() {
  return localStorage.getItem('api_mode') || 'external';
}

class KaidolAdapter {
  constructor() {
    this.baseUrl = localStorage.getItem('kaidol_api_url') || 'http://localhost:8000';
  }

  getKey() {
    return 'internal';
  }

  async generateImage(params) {
    const result = await kaidolApi.generateImage({
      prompt: params.prompt,
      negativePrompt: params.negative_prompt,
      workflow: params.image_url ? 'qwen_i2i' : 'flux_lora',
      seed: params.seed || -1,
      width: params.width || 1024,
      height: params.height || 1024,
      steps: params.steps || 30,
      cfgScale: params.guidance_scale || 7.5,
      batchSize: params.num_images || 1,
      image: params.image_url || null,
    });

    return {
      images: result.images || (result.output_urls || []),
      task_id: result.task_id,
      status: result.status || 'completed',
    };
  }

  async generateVideo(params) {
    const result = await kaidolApi.generateVideo({
      prompt: params.prompt,
      image: params.image_url || null,
      workflow: params.image_url ? 'wan22_i2v' : 'wan22_t2v',
      duration: params.duration || 2.7,
      seed: params.seed || -1,
      resolution: params.resolution || '480x832',
    });

    return {
      video_url: result.video_url || (result.output_urls && result.output_urls[0]),
      task_id: result.task_id,
      status: result.status || 'completed',
    };
  }

  async uploadFile(file) {
    return kaidolApi.uploadFile(file);
  }

  getDimensionsFromAR(ar) {
    switch (ar) {
      case '1:1': return [1024, 1024];
      case '16:9': return [1280, 720];
      case '9:16': return [720, 1280];
      case '4:3': return [1152, 864];
      case '3:2': return [1216, 832];
      case '21:9': return [1536, 640];
      default: return [1024, 1024];
    }
  }
}

const kaidolAdapter = new KaidolAdapter();

export function getApiClient() {
  return getApiMode() === 'internal' ? kaidolAdapter : muapi;
}

export const apiClient = getApiMode() === 'internal' ? kaidolAdapter : muapi;
