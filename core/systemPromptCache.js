import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

import { Buffer } from "buffer";

let systemPromptText = "";
let lastUpdated = 0;

const PROMPT_URL = process.env.PROMPT_PATH_URL;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function refreshSystemPrompt() {
  try {
    const res = await fetch(PROMPT_URL, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        // intentionally NOT setting "Accept: application/vnd.github.v3.raw"
        // so we receive a JSON response with base64 content
      },
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();

    // content is base64 encoded
    systemPromptText = Buffer.from(data.content, "base64").toString("utf-8");
    lastUpdated = Date.now();

    console.log(
      `✅ System prompt reloaded (${(systemPromptText.length / 1024).toFixed(
        1
      )} KB)`
    );
  } catch (err) {
    console.error("❌ Failed to fetch system prompt:", err.message);
  }
}

export function getCachedSystemPrompt() {
  return systemPromptText;
}
