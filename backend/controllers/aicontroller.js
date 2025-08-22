import { GoogleGenerativeAI } from "@google/generative-ai";
import { conceptExplainPrompt, questionAnswerPrompt } from "../utils/prompts.js";
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenerativeAI(apiKey);

// desc Generate interview questions and answers using Gemini
// route POST /api/ai/generate-questions
// access Private
export const generateInterviewQuestion = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;
    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = questionAnswerPrompt(role, experience, topicsToFocus, numberOfQuestions);

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    // ✅ Correct way to read response
    const rawText = result.response.candidates[0].content.parts[0].text;

    const cleanedText = rawText
      .replace(/```(?:json|javascript)?/g, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(cleanedText);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};

// desc Explain a concept from interview question
// route POST /api/ai/generate-explanation
// access Private
export const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: "Missing question parameter" });
    }

    const prompt = conceptExplainPrompt(question);

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    // ✅ Correct response extraction
    const rawText = result.response.candidates[0].content.parts[0].text;

    console.log("AI Raw Text:", rawText);

    const cleanedText = rawText
      .replace(/```(?:json|javascript)?/g, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(cleanedText);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate concept explanation",
      error: error.message,
    });
  }
};
