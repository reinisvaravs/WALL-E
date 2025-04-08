import express from "express";

export function statusRouter(sharedData) {
  const router = express.Router();

  // root /status
  router.get("/", async (req, res) => {
    res.json({
      model: process.env.OPENAI_MODEL || "undefined",
      channelId: sharedData.allowedChannelIdRef.value || "undefined",
    });
  });

  return router;
}
