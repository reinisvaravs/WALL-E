import { loadAndEmbedKnowledge } from "../knowledgeEmbedder.js";
// import { getChannelId } from "../db.js";
import { refreshSystemPrompt } from "./systemPromptCache.js";

export async function initializeBotData() { // add (client, safeMode) for commented code under
  await refreshSystemPrompt(); // load prompt at startup
  await loadAndEmbedKnowledge(); // add const success for the code under

  // if (success) {
  //   const channelId = await getChannelId(`${safeMode}_channel_id`);
  //   const channel = await client.channels.fetch(channelId);
  //   if (channel) {
  //     channel.send("I’m now online. 🤖");
  //   }
  // }

  // auto-refresh knowledge + prompt
  setInterval(async () => {
    console.log("🔄 Auto-refreshing GitHub knowledge + system prompt...");
    await loadAndEmbedKnowledge();
    await refreshSystemPrompt();
  }, 10 * 60 * 1000); // 10 minutes
}
