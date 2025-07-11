import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, botPersonality, botName } = await req.json();

    console.log("Received request:", {
      messagesCount: messages?.length,
      botName,
      firstMessage: messages?.[0]?.content,
    });

    // Validate input parameters
    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid messages format:", messages);
      return new Response(
        JSON.stringify({
          error: "Invalid messages format",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!botPersonality || !botName) {
      console.error("Missing bot info:", { botPersonality, botName });
      return new Response(
        JSON.stringify({
          error: "Bot personality and name are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate API key exists and is not the placeholder
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === "your-openai-api-key-here"
    ) {
      console.error("API key not configured");
      return new Response(
        JSON.stringify({
          error:
            "OpenAI API key not configured. Please replace 'your-openai-api-key-here' in .env.local with your actual OpenAI API key.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Starting chat request with:", {
      botName,
      messagesCount: messages.length,
    });

    // Create system message with bot personality
    const systemMessage = {
      role: "system" as const,
      content: `You are ${botName}, an AI assistant with the following personality and instructions: ${botPersonality}

Key guidelines:
- Stay in character based on the personality description
- Be helpful, engaging, and conversational
- Keep responses concise but informative (under 150 words)
- Adapt your tone to match the personality given
- If asked about your identity, refer to yourself as ${botName}`,
    };

    console.log("Calling streamText with model gpt-3.5-turbo");

    const result = await streamText({
      model: openai("gpt-3.5-turbo"),
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      maxTokens: 300,
    });

    console.log("streamText completed successfully");
    return result.toDataStreamResponse();
  } catch (error: unknown) {
    console.error("Chat API Error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error message:", errorMessage);

    // Handle specific OpenAI errors
    if (errorMessage.includes("rate limit")) {
      return new Response(
        JSON.stringify({
          error:
            "Rate limit exceeded. Please wait a moment before sending another message.",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (errorMessage.includes("quota")) {
      return new Response(
        JSON.stringify({
          error:
            "OpenAI quota exceeded. Please check your OpenAI account usage.",
        }),
        {
          status: 402,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (errorMessage.includes("invalid_api_key")) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid OpenAI API key. Please check your API key configuration.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error:
          "An error occurred while processing your request. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
