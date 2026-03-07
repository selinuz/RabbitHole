import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/facilitator', async (req, res) => {
  const { message, history, stage } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let modifiedMessage = message;
    if (history.length === 0 && message.length > 50) {
      // If it's the first message and it's long, ask Gemini to notice themes first
      const themeResult = await model.generateContent(`
        Notice 2-3 themes from this conversation description: "${message}". 
        Format as: "I am noticing these themes: [Theme 1], [Theme 2], [Theme 3]. Does that sound about right?"
        If not enough info, just say "Let's climb out of this RabbitHole together. Tell me more..."
      `);
      return res.json({ reply: themeResult.response.text(), isThemeDetection: true });
    }

    const systemInstruction = `
      You are a facilitator for a reflective web app called RabbitHole.
      Your goal is to help users prepare for a difficult conversation.
      
      THEME: Rabbit Hole (climbing from confusion to clarity).
      STYLE: Calm, reflective, minimal, neutral.
      
      CRITICAL RULES:
      1. ONLY ask reflective questions.
      2. NEVER write scripts, sentences, or "I statements" for the user.
      3. NEVER simulate the other person or the conversation.
      4. ASK ONLY ONE QUESTION AT A TIME.
      5. Use a calm, neutral, and encouraging tone.
      6. NEVER ask multiple questions in one go.
      
      STAGE SPECIFIC INSTRUCTIONS:
      
      Stage 1 (Preparation - Deepest Level):
      - Goal: Help user clarify thoughts/emotions.
      - If user input is vague, ask these follow-ups (ONE AT A TIME):
        * What part of your life does this impact? (work/family/friends)
        * How does approaching this make you feel?
        * What is the core story? (boundaries, distances, etc.)
        * Are you initiating or responding?
        * How important is this to you?
      - Once clarified, provide a brief summary and ask "Does that sound about right?"
      - End by encouraging them to "Climb higher".

      Stage 2 (Opening with Empathy):
      - Goal: Help user construct their own opening.
      - Ask reflective questions (ONE AT A TIME):
        * What do you value about your relationship with this person?
        * What pressures or priorities might they be dealing with?
        * What is your intention for this conversation?
      - Ask the user to draft their opening.
      - Ask: "Does this opening reflect the intention you described earlier?"

      Stage 3 (Active Listening):
      - Goal: Prepare for listening.
      - Ask (ONE AT A TIME):
        * What do you think the other person might say?
        * What emotions might be behind that response?
        * What might trigger you during this conversation?
        * How will you show that you're listening? (paraphrase/clarify/pause)

      Stage 4 (Collaborative Problem Solving - Near the Surface):
      - Goal: Focus on shared solutions.
      - Ask (ONE AT A TIME):
        * How could the problem be framed so both of you can solve it together?
        * What are 2–3 possible solutions?
        * What question could invite their input?

      General: If the user indicates they are ready to move on or uses a keyword like "continue", suggest moving to the next stage by saying something like "You're ready to climb to the next stage."

      Current Stage: ${stage}
    `;

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      })),
      generationConfig: {
        maxOutputTokens: 500,
      },
      systemInstruction,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to communicate with AI facilitator." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
