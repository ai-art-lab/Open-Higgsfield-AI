/**
 * Kaidol Internal API Client
 *
 * resource-gen FastAPI 서버와 통신하는 내부 API 클라이언트.
 * Settings에서 "Internal API" 모드 선택 시 muapi.js 대신 사용됩니다.
 *
 * API Base: KAIDOL_API_URL env var 또는 http://localhost:8000
 */

const KAIDOL_API_URL =
  localStorage.getItem("kaidol_api_url") || "http://localhost:8000";

/**
 * Submit a generation task to resource-gen
 * @param {string} endpoint - API endpoint (e.g., '/api/generate/image')
 * @param {object} params - Generation parameters
 * @returns {Promise<object>} - Task result with task_id
 */
export async function submitTask(endpoint, params) {
  const url = `${KAIDOL_API_URL}${endpoint}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`[Kaidol API] ${response.status}: ${error}`);
  }

  return response.json();
}

/**
 * Poll for task completion
 * @param {string} taskId - Task ID from submitTask
 * @param {number} intervalMs - Poll interval in milliseconds
 * @param {number} timeoutMs - Maximum wait time
 * @param {function} onProgress - Progress callback(progress, status)
 * @returns {Promise<object>} - Completed task result
 */
export async function pollTask(
  taskId,
  intervalMs = 2000,
  timeoutMs = 300000,
  onProgress = null
) {
  const startTime = Date.now();
  const url = `${KAIDOL_API_URL}/api/tasks/${taskId}`;

  while (Date.now() - startTime < timeoutMs) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`[Kaidol API] Poll error: ${response.status}`);
    }

    const data = await response.json();
    const status = data.status;

    if (onProgress) {
      onProgress(data.progress || 0, status);
    }

    if (status === "completed") {
      return data;
    }
    if (status === "failed") {
      throw new Error(`[Kaidol API] Task failed: ${data.error || "unknown"}`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`[Kaidol API] Task ${taskId} timed out after ${timeoutMs}ms`);
}

/**
 * Generate image via resource-gen ComfyUI pipeline
 * @param {object} params - { prompt, workflow, lora, seed, resolution, ... }
 * @param {function} onProgress - Progress callback
 * @returns {Promise<object>} - { images: [url, ...], metadata: {} }
 */
export async function generateImage(params, onProgress = null) {
  const task = await submitTask("/api/generate/image", {
    prompt: params.prompt,
    negative_prompt: params.negativePrompt || "",
    workflow: params.workflow || "flux_lora",
    lora_path: params.lora || null,
    seed: params.seed || -1,
    width: params.width || 1024,
    height: params.height || 1024,
    steps: params.steps || 30,
    cfg_scale: params.cfgScale || 7.5,
    batch_size: params.batchSize || 1,
  });

  return pollTask(task.task_id, 2000, 120000, onProgress);
}

/**
 * Generate video via resource-gen ComfyUI pipeline
 * @param {object} params - { prompt, image, workflow, duration, ... }
 * @param {function} onProgress - Progress callback
 * @returns {Promise<object>} - { video_url, metadata }
 */
export async function generateVideo(params, onProgress = null) {
  const task = await submitTask("/api/generate/video", {
    prompt: params.prompt,
    image_path: params.image || null,
    workflow: params.workflow || "wan22_i2v",
    duration: params.duration || 2.7,
    seed: params.seed || -1,
    resolution: params.resolution || "480x832",
  });

  return pollTask(task.task_id, 3000, 300000, onProgress);
}

/**
 * Generate TTS via Fish-Speech or ElevenLabs
 * @param {object} params - { text, voice, provider, language }
 * @param {function} onProgress - Progress callback
 * @returns {Promise<object>} - { audio_url, duration_sec }
 */
export async function generateTTS(params, onProgress = null) {
  const task = await submitTask("/api/generate/tts", {
    text: params.text,
    voice_id: params.voice || null,
    provider: params.provider || "fish_speech",
    language: params.language || "ko",
    reference_audio: params.referenceAudio || null,
  });

  return pollTask(task.task_id, 1000, 60000, onProgress);
}

/**
 * Upload a file to resource-gen
 * @param {File} file - File to upload
 * @returns {Promise<object>} - { file_id, url, filename }
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${KAIDOL_API_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`[Kaidol API] Upload failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Check resource-gen server health
 * @returns {Promise<boolean>}
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${KAIDOL_API_URL}/health`, { timeout: 5000 });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get available models/workflows from resource-gen
 * @returns {Promise<object>} - { image_workflows, video_workflows, tts_providers }
 */
export async function getAvailableModels() {
  try {
    const response = await fetch(`${KAIDOL_API_URL}/api/models`);
    if (!response.ok) return { image_workflows: [], video_workflows: [], tts_providers: [] };
    return response.json();
  } catch {
    return { image_workflows: [], video_workflows: [], tts_providers: [] };
  }
}

/**
 * Get API base URL
 * @returns {string}
 */
export function getApiUrl() {
  return KAIDOL_API_URL;
}

/**
 * Set API base URL (persisted in localStorage)
 * @param {string} url
 */
export function setApiUrl(url) {
  localStorage.setItem("kaidol_api_url", url);
  window.location.reload();
}
