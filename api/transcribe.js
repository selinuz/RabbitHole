export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const chunks = [];
  await new Promise((resolve, reject) => {
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", resolve);
    req.on("error", reject);
  });

  const audioBuffer = Buffer.concat(chunks);
  const contentType = req.headers["content-type"] || "audio/webm";

  const formData = new FormData();
  const audioBlob = new Blob([audioBuffer], { type: contentType });
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model_id", "scribe_v1");

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("ElevenLabs STT error:", error);
    return res.status(502).json({ error: "Transcription failed" });
  }

  const data = await response.json();
  return res.json({ transcript: data.text || "" });
}
