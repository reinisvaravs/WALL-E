import { getCachedSystemPrompt } from "../core/systemPromptCache.js";

export function buildSystemPrompt(relevantChunks) {
  const basePrompt = getCachedSystemPrompt();
  return `${basePrompt}\n\n${relevantChunks.join("\n\n")}`.trim();
}
