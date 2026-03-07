import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/facilitator", async (req, res) => {
  const { stage, message } = req.body;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Stage 1: Acknowledge the initial entry warmly
    if (stage === "ack") {
      const result = await model.generateContent(`
        You are a calm, warm facilitator for a reflective app called RabbitHole that helps people prepare for difficult conversations.

        A user just shared this situation with you: "${message}"

        Write 2-3 sentences that:
        1. Acknowledge what they shared without being patronizing
        2. Reflect back what you notice (themes, emotions hinted at, complexity)
        3. Feel warm but grounded — not overly therapist-y

        Do NOT ask a question. Do NOT offer advice. Just acknowledge.
        Keep it under 60 words.
      `);
      return res.json({ reply: result.response.text() });
    }

    // Stage 2: Extract the core issue from everything gathered
    if (stage === "core_issue") {
      const result = await model.generateContent(`
        You are a facilitator helping someone prepare for a difficult conversation.

        Here is the full context they've shared: "${message}"

        In 1-2 sentences, identify the core tension or issue at the heart of this situation.
        Be specific to what they said — not generic. Write it as a statement, not a question.
        Do not use "you" — write it as an observation about the situation.
        Keep it under 40 words.
      `);
      return res.json({ reply: result.response.text() });
    }

    // Stage 3: Generate perspective flip cards
    if (stage === "perspectives") {
      const result = await model.generateContent(`
        You are helping someone prepare for a difficult conversation by understanding the other person's perspective.

        Context: "${message}"

        Generate exactly 3 perspective insights as a JSON array. Each has:
        - "front": A possible feeling, belief, or pressure the other person might be experiencing (1-2 sentences, empathetic, specific)
        - "back": How that feeling or belief might affect the way they hear this conversation (1-2 sentences, practical)

        Return ONLY valid JSON like this (no markdown, no explanation):
        [{"front": "...", "back": "..."}, {"front": "...", "back": "..."}, {"front": "...", "back": "..."}]
      `);

      let perspectives = [];
      try {
        const text = result.response.text().trim();
        const cleaned = text.replace(/```json|```/g, "").trim();
        perspectives = JSON.parse(cleaned);
      } catch {
        perspectives = [
          {
            front:
              "They may not have all the context you have about why this matters to you.",
            back: "Starting by sharing your intent — not your grievance — gives them a chance to lean in.",
          },
          {
            front: "They might feel defensive if they sense criticism coming.",
            back: "An opening that signals collaboration rather than confrontation can lower their guard.",
          },
          {
            front:
              "They may be carrying their own stress about this topic that you're unaware of.",
            back: "Leaving space for their side early makes them feel the conversation is safe.",
          },
        ];
      }

      return res.json({ perspectives });
    }

    // Stage 4: Rewrite instinct phrase using conversation science
    if (stage === "rewrite") {
      const result = await model.generateContent(`
        You are a conversation coach trained in Gottman Method principles and nonviolent communication.

        Context about the situation and tone: "${message}"

        Rewrite the user's instinct phrase in 3 different ways. Return ONLY valid JSON (no markdown):
        {
          "iStatement": "A version using I-statements that avoids blame (e.g. 'I feel... when... because...')",
          "gottman": "A soft, Gottman-style opening that avoids harsh start-ups and invites dialogue",
          "framing": "A version that frames this as a shared challenge both people can solve together"
        }

        Rules:
        - Each version should feel natural and conversational, not scripted
        - Match the tone they selected (gentle/direct/curious) if mentioned
        - Keep each under 35 words
        - Do NOT use placeholder brackets like [name] — write complete sentences
      `);

      let rewrite = null;
      try {
        const text = result.response.text().trim();
        const cleaned = text.replace(/```json|```/g, "").trim();
        rewrite = JSON.parse(cleaned);
      } catch {
        rewrite = {
          iStatement:
            "I've been feeling unsettled about something, and I think it's worth us talking through it together.",
          gottman:
            "There's something on my mind that matters to me — would you be open to hearing it?",
          framing:
            "I think we're both affected by this, and I'd like us to figure it out together.",
        };
      }

      return res.json({ rewrite });
    }

    res.status(400).json({ error: "Unknown stage." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to communicate with AI facilitator." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
