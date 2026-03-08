import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    // Stage 1 pre-step: Analyze initial input to determine what's already known
    if (stage === "analyze") {
      const result = await model.generateContent(`
        You are analyzing a user's initial message to a reflective conversation-prep app.

        User's message: "${message}"

        Determine what information can already be inferred from this message. Return ONLY valid JSON (no markdown):
        {
          "lifeArea": "Work" | "Family" | "Friends" | "Relationship" | "Other" | null,
          "feeling": "Anxious" | "Hurt" | "Frustrated" | "Hopeful" | "Confused" | "Overwhelmed" | "Nervous" | "Sad" | null,
          "timeline": "I'm initiating it" | "Responding to something" | null,
          "importance": "It's everything right now" | "Really important" | "Somewhat important" | "I'm not sure yet" | null
        }

        Rules:
        - Only set a value if it is clearly inferable from the message. If unsure, return null.
        - "lifeArea" examples: mention of boyfriend/girlfriend/partner/husband/wife → "Relationship", mention of boss/work/job/colleague → "Work", mention of mom/dad/sibling/family → "Family", mention of friend → "Friends"
        - "feeling" examples: "scared", "worried" → "Anxious"; "upset", "betrayed" → "Hurt"; "annoyed", "angry" → "Frustrated"; "lost", "don't know" → "Confused"
        - "timeline": if they say "I need to tell", "I want to bring up", "I'm going to" → "I'm initiating it"; if they say "they said", "I need to respond", "they brought up" → "Responding to something"
        - "importance": only infer if they use strong language like "need to", "can't go on", "urgent" → "It's everything right now"; otherwise null
      `);

      let inferred = {
        lifeArea: null,
        feeling: null,
        timeline: null,
        importance: null,
      };
      try {
        const text = result.response.text().trim();
        const cleaned = text.replace(/```json|```/g, "").trim();
        inferred = JSON.parse(cleaned);
      } catch {
        // return all nulls — ask everything
      }

      return res.json({ inferred });
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

        The user is preparing for a difficult conversation. They have identified a specific perspective of the other person to ground their approach in empathy.

        Context about the situation, the other person's perspective, and the desired tone: "${message}"

        IMPORTANT: The "Perspective identified" field above describes how the other person may be experiencing this situation. Let this perspective actively shape the opener templates — each one should in some way acknowledge or leave room for that reality. For example, if the perspective says the other person may feel pressured or caught off guard, the templates should create space for their experience rather than only asserting the user's needs.

        Rewrite the user's instinct phrase in 3 different ways. Instead of writing complete scripts, provide **templates with fill-in-the-blank brackets** (e.g., [feeling], [behavior], [specific request]) so the user can use their own words.

        Return ONLY valid JSON (no markdown):
        {
          "iStatement": "A template using I-statements that avoids blame and reflects awareness of their perspective",
          "gottman": "A template for a soft, Gottman-style opening that creates space for the other person given their likely state",
          "framing": "A template that frames this as a shared challenge and gently acknowledges the other person's reality"
        }

        Rules:
        - Each version should use bracketed placeholders for specific details
        - Match the tone they selected (gentle/direct/curious) if mentioned
        - Keep each under 40 words
        - Use descriptive brackets like [how you feel] or [what you noticed]
        - Do NOT simply paste the perspective verbatim — let it inform the structure and invitation of the opener
      `);

      let rewrite = null;
      try {
        const text = result.response.text().trim();
        const cleaned = text.replace(/```json|```/g, "").trim();
        rewrite = JSON.parse(cleaned);
      } catch {
        rewrite = {
          iStatement:
            "I've been feeling [how you feel] about [the situation], and I was hoping we could [your goal].",
          gottman:
            "I've been thinking about [topic] and realized I'd love to [desire] — would you be open to talking?",
          framing:
            "I want us to both feel [positive state] when it comes to [issue], and I'd like to hear your thoughts on [specific part].",
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
}
