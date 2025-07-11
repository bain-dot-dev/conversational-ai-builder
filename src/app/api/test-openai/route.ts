import { NextRequest } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: NextRequest) {
  try {
    const { messages, botPersonality, botName } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemMessage = {
      role: "system" as const,
      content: `You are ${botName}, an AI assistant with the following personality: ${botPersonality}`,
    };

    console.log("Making direct OpenAI call...");

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 300,
    });

    console.log("OpenAI response received:", response.choices[0]?.message);

    return Response.json({
      message: response.choices[0]?.message?.content,
      usage: response.usage,
    });
  } catch (error: unknown) {
    console.error("Direct OpenAI API Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error details:", errorMessage);

    return Response.json(
      { error: `OpenAI API Error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
