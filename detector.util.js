import { env, pipeline } from "https://esm.run/@huggingface/transformers";

env.allowLocalModels = false;


async function isWebGPUAvailable() {
  if (!navigator.gpu) return false;

  try {
    const adapter = await navigator.gpu.requestAdapter();
    return adapter !== null;
  } catch (e) {
    return false;
  }
}

export const detector = await pipeline(
  "object-detection",
  "Xenova/detr-resnet-50",
  {
    device: (await isWebGPUAvailable()) ? "webgpu" : "wasm",
  }
);
