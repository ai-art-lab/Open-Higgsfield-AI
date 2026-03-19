import {
  getInternalImageWorkflow,
  getInternalVideoWorkflow,
  getInternalI2IWorkflow,
  getInternalI2VWorkflow,
} from './models.js';

function getApiBaseUrl() {
  const fromStorage = localStorage.getItem('kaidol_api_url');
  const fromEnv = import.meta.env.VITE_KAIDOL_API_URL;
  return fromStorage || fromEnv || 'http://localhost:8000';
}

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const key = localStorage.getItem('kaidol_api_key');
  if (key) headers['X-API-Key'] = key;
  return headers;
}

function requestId() {
  return `kaidol-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseOutputUrl(payload) {
  if (!payload) return null;

  const first = payload.outputs?.[0] || payload.output_urls?.[0] || payload.images?.[0];
  if (!first) return null;
  if (typeof first === 'string') return first;

  return first.url || first.path || first.file || null;
}

function aspectRatioToDimensions(ar = '1:1') {
  switch (ar) {
    case '1:1':
      return [1024, 1024];
    case '16:9':
      return [1280, 720];
    case '9:16':
      return [720, 1280];
    case '4:3':
      return [1152, 864];
    case '3:2':
      return [1216, 832];
    case '21:9':
      return [1536, 640];
    default:
      return [1024, 1024];
  }
}

class KaidolApiClient {
  constructor() {
    this.completed = new Map();
  }

  get baseUrl() {
    return getApiBaseUrl();
  }

  getKey() {
    return 'internal';
  }

  getDimensionsFromAR(ar) {
    return aspectRatioToDimensions(ar);
  }

  async postJson(path, payload) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Internal API request failed: ${response.status} ${text.slice(0, 160)}`);
    }

    return response.json();
  }

  rememberResult(id, payload) {
    this.completed.set(id, payload);
  }

  async pollForResult(requestIdValue) {
    if (this.completed.has(requestIdValue)) {
      return this.completed.get(requestIdValue);
    }

    return {
      id: requestIdValue,
      request_id: requestIdValue,
      status: 'completed',
      outputs: [],
      url: null,
    };
  }

  async generateImage(params) {
    const [width, height] = params.width && params.height
      ? [params.width, params.height]
      : aspectRatioToDimensions(params.aspect_ratio);

    const workflow = params.workflow || getInternalImageWorkflow(params.model);
    const payload = {
      workflow,
      prompt: params.prompt,
      negative_prompt: params.negative_prompt || '',
      seed: params.seed && params.seed !== -1 ? params.seed : undefined,
      width,
      height,
    };

    const data = await this.postJson('/api/image/generate', payload);
    const id = data.prompt_id || requestId();
    const url = parseOutputUrl(data);

    if (params.onRequestId) params.onRequestId(id);

    const normalized = {
      ...data,
      id,
      request_id: id,
      status: data.status || 'completed',
      outputs: data.outputs || (url ? [url] : []),
      url,
    };

    this.rememberResult(id, normalized);
    return normalized;
  }

  async generateVideo(params) {
    const workflow = params.workflow || getInternalVideoWorkflow(params.model);
    const payload = {
      workflow,
      prompt: params.prompt,
      seed: params.seed && params.seed !== -1 ? params.seed : undefined,
      image_path: params.image_url || undefined,
    };

    const data = await this.postJson('/api/video/generate', payload);
    const id = data.prompt_id || requestId();
    const url = parseOutputUrl(data);

    if (params.onRequestId) params.onRequestId(id);

    const normalized = {
      ...data,
      id,
      request_id: id,
      status: data.status || 'completed',
      outputs: data.outputs || (url ? [url] : []),
      url,
    };

    this.rememberResult(id, normalized);
    return normalized;
  }

  async generateI2I(params) {
    return this.generateImage({
      ...params,
      workflow: getInternalI2IWorkflow(params.model),
    });
  }

  async generateI2V(params) {
    return this.generateVideo({
      ...params,
      workflow: getInternalI2VWorkflow(params.model),
      image_url: params.image_url,
    });
  }

  async processV2V() {
    throw new Error('Internal API mode does not support video-to-video tools yet.');
  }

  async uploadFile(file) {
    return URL.createObjectURL(file);
  }
}

export const kaidolApi = new KaidolApiClient();
