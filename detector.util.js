import { env, pipeline } from "https://esm.run/@huggingface/transformers";

env.allowLocalModels = false;

export const detector = await pipeline(
  "object-detection",
  "Xenova/detr-resnet-50",
  {
    device: navigator.gpu ? "webgpu" : "wasm",
  }
);
