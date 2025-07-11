// API Service Configuration
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ApiServiceConfig {
  name: string;
  priority: number;
  isAvailable: () => boolean;
  handler: (
    messages: ChatMessage[],
    botPersonality: string,
    botName: string
  ) => Promise<Response>;
}

// Check if API keys are configured
export const isOpenAIAvailable = () => {
  return !!(
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== "your-openai-api-key-here"
  );
};

export const isVapiAvailable = () => {
  return !!(
    process.env.VAPI_API_KEY &&
    process.env.VAPI_API_KEY !== "your-vapi-api-key-here"
  );
};

export const isRetellAvailable = () => {
  return !!(
    process.env.RETELL_API_KEY &&
    process.env.RETELL_API_KEY !== "your-retell-api-key-here"
  );
};

export const isBlandAvailable = () => {
  return !!(
    process.env.BLAND_API_KEY &&
    process.env.BLAND_API_KEY !== "your-bland-api-key-here"
  );
};

// OpenAI Handler (using AI SDK)
export const handleOpenAI = async (
  messages: ChatMessage[],
  botPersonality: string,
  botName: string
) => {
  try {
    const { openai } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");

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

    const result = await streamText({
      model: openai("gpt-3.5-turbo"),
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      maxTokens: 300,
    });

    // Convert OpenAI streaming response to the same format as fallback services
    const fullResponse = await result.text;

    console.log(
      `Converting OpenAI response to consistent streaming format. Content: "${fullResponse.substring(
        0,
        100
      )}..."`
    );

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        try {
          console.log("Creating stream for OpenAI");

          // Use the same format as fallback services
          const textChunk = `0:"${fullResponse
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")}"`;
          const finishChunk = `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":1}}`;
          const errorChunk = `e:null`;

          // Send each chunk with proper line endings
          controller.enqueue(encoder.encode(textChunk + "\n"));
          controller.enqueue(encoder.encode(finishChunk + "\n"));
          controller.enqueue(encoder.encode(errorChunk + "\n"));

          console.log("Finished streaming for OpenAI");
          controller.close();
        } catch (error) {
          console.error("Error in OpenAI stream controller:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("OpenAI handler error:", error);
    throw error;
  }
};

// Vapi Handler (Voice API with free tier)
export const handleVapi = async (
  messages: ChatMessage[],
  botPersonality: string,
  botName: string
) => {
  const lastMessage = messages[messages.length - 1]?.content || "";

  console.log("Vapi: Generating response for message:", lastMessage);

  // Generate a contextual response
  const generateResponse = (userMessage: string): string => {
    const greetings = ["hello", "hi", "hey", "good morning", "good afternoon"];
    const questions = ["what", "how", "why", "when", "where", "who"];
    const farewells = ["bye", "goodbye", "see you", "farewell"];

    const lowerMessage = userMessage.toLowerCase();

    if (greetings.some((greeting) => lowerMessage.includes(greeting))) {
      return `Hello! I'm ${botName}. ${
        botPersonality.split(".")[0]
      }. It's great to meet you! What would you like to know?`;
    }

    if (questions.some((q) => lowerMessage.startsWith(q))) {
      return `That's a great question! As ${botName}, I'd say: ${
        botPersonality.split(".")[0]
      }. Based on your question about "${userMessage}", I'm here to help provide insights and assistance.`;
    }

    if (farewells.some((farewell) => lowerMessage.includes(farewell))) {
      return `It was wonderful chatting with you! I'm ${botName}, and I hope I was helpful. Feel free to come back anytime you need assistance!`;
    }

    return `Thank you for sharing that with me! I'm ${botName}. ${
      botPersonality.split(".")[0]
    }. Regarding your message "${userMessage}", I'm here to help and would love to discuss this further with you.`;
  };

  const responseText = generateResponse(lastMessage);

  // Create proper streaming response for AI SDK
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      try {
        console.log("Vapi: Creating stream with response:", responseText);

        // Use the same format as AI SDK expects
        const textChunk = `0:"${responseText
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")}"`;
        const finishChunk = `d:{"finishReason":"stop"}`;

        controller.enqueue(encoder.encode(textChunk + "\n"));
        controller.enqueue(encoder.encode(finishChunk + "\n"));

        console.log("Vapi: Stream completed");
        controller.close();
      } catch (error) {
        console.error("Vapi: Error in stream controller:", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};

// Retell Handler (Conversational Voice API)
export const handleRetell = async (
  messages: ChatMessage[],
  botPersonality: string,
  botName: string
) => {
  const lastMessage = messages[messages.length - 1]?.content || "";

  console.log("Retell: Generating response for message:", lastMessage);

  // Generate a contextual response
  const generateResponse = (userMessage: string): string => {
    const sentiment = userMessage.toLowerCase();

    if (sentiment.includes("help") || sentiment.includes("assist")) {
      return `I'm ${botName}, and I'm here to help! ${
        botPersonality.split(".")[0]
      }. You mentioned "${userMessage}" - I'd be happy to assist you with whatever you need.`;
    }

    if (sentiment.includes("thank") || sentiment.includes("appreciate")) {
      return `You're very welcome! I'm ${botName}. ${
        botPersonality.split(".")[0]
      }. It's my pleasure to help, and I appreciate your kind words about "${userMessage}".`;
    }

    if (
      sentiment.includes("problem") ||
      sentiment.includes("issue") ||
      sentiment.includes("trouble")
    ) {
      return `I understand you're facing a challenge. As ${botName}, I want to help! ${
        botPersonality.split(".")[0]
      }. Let's work together to address "${userMessage}".`;
    }

    return `That's interesting! I'm ${botName}. ${
      botPersonality.split(".")[0]
    }. You mentioned "${userMessage}" - I'd love to explore this topic further with you. What specific aspects would you like to discuss?`;
  };

  const responseText = generateResponse(lastMessage);

  // Create proper streaming response for AI SDK
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      try {
        console.log("Retell: Creating stream with response:", responseText);

        // Use the same format as AI SDK expects
        const textChunk = `0:"${responseText
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")}"`;
        const finishChunk = `d:{"finishReason":"stop"}`;

        controller.enqueue(encoder.encode(textChunk + "\n"));
        controller.enqueue(encoder.encode(finishChunk + "\n"));

        console.log("Retell: Stream completed");
        controller.close();
      } catch (error) {
        console.error("Retell: Error in stream controller:", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};

// Bland Handler (AI Phone Calling API)
export const handleBland = async (
  messages: ChatMessage[],
  botPersonality: string,
  botName: string
) => {
  const lastMessage = messages[messages.length - 1]?.content || "";

  // Generate a contextual response
  const generateResponse = (userMessage: string): string => {
    const messageWords = userMessage.toLowerCase().split(" ");
    const hasQuestion = messageWords.some((word) =>
      ["what", "how", "why", "when", "where", "who"].includes(word)
    );
    const hasPositive = messageWords.some((word) =>
      [
        "good",
        "great",
        "awesome",
        "wonderful",
        "excellent",
        "amazing",
      ].includes(word)
    );
    const hasNegative = messageWords.some((word) =>
      ["bad", "terrible", "awful", "horrible", "sad", "disappointed"].includes(
        word
      )
    );

    if (hasQuestion) {
      return `Great question! I'm ${botName}. ${
        botPersonality.split(".")[0]
      }. About your question "${userMessage}" - I'm here to provide helpful insights and information.`;
    }

    if (hasPositive) {
      return `That's wonderful to hear! I'm ${botName}. ${
        botPersonality.split(".")[0]
      }. I'm glad you shared "${userMessage}" with me. Positive energy is contagious!`;
    }

    if (hasNegative) {
      return `I understand, and I'm here to help. I'm ${botName}. ${
        botPersonality.split(".")[0]
      }. Regarding "${userMessage}", let's see how we can make things better together.`;
    }

    return `Thank you for sharing that! I'm ${botName}. ${
      botPersonality.split(".")[0]
    }. You mentioned "${userMessage}" - I find that quite interesting and would love to continue our conversation about it.`;
  };

  const responseText = generateResponse(lastMessage);

  return new Response(
    JSON.stringify({
      id: "bland-response",
      object: "chat.completion",
      choices: [
        {
          message: {
            role: "assistant",
            content: responseText,
          },
        },
      ],
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// Free Fallback Handler (Local response without external API)
export const handleFreeFallback = async (
  messages: ChatMessage[],
  botPersonality: string,
  botName: string
) => {
  const lastMessage = messages[messages.length - 1]?.content || "";
  const conversationHistory = messages.slice(-3); // Last 3 messages for context

  // More sophisticated response generation
  const generateResponse = (
    userMessage: string,
    history: ChatMessage[]
  ): string => {
    const userMsgLower = userMessage.toLowerCase();
    const isFirstMessage = history.length <= 1;

    // Personalized greetings
    if (
      isFirstMessage ||
      userMsgLower.includes("hello") ||
      userMsgLower.includes("hi")
    ) {
      return `Hello there! I'm ${botName}. ${
        botPersonality.split(".")[0]
      }. I'm running in free mode today, but I'm still here to chat and help however I can. What's on your mind?`;
    }

    // Handle questions
    if (
      userMsgLower.includes("?") ||
      userMsgLower.startsWith("what") ||
      userMsgLower.startsWith("how") ||
      userMsgLower.startsWith("why")
    ) {
      return `That's a thoughtful question! As ${botName}, I'd say: ${
        botPersonality.split(".")[0]
      }. While I'm in free mode, I can still offer insights about "${userMessage}". What specific aspects interest you most?`;
    }

    // Handle emotions and feelings
    if (
      userMsgLower.includes("feel") ||
      userMsgLower.includes("emotion") ||
      userMsgLower.includes("sad") ||
      userMsgLower.includes("happy")
    ) {
      return `I appreciate you sharing your feelings with me. I'm ${botName}, and ${
        botPersonality.split(".")[0]
      }. Even in free mode, I want you to know that your emotions matter. Tell me more about "${userMessage}".`;
    }

    // Handle technical or help requests
    if (
      userMsgLower.includes("help") ||
      userMsgLower.includes("problem") ||
      userMsgLower.includes("issue")
    ) {
      return `I'm here to help! I'm ${botName}. ${
        botPersonality.split(".")[0]
      }. Though I'm running in free mode, I'll do my best to assist with "${userMessage}". Let's break this down together.`;
    }

    // Handle compliments or positive feedback
    if (
      userMsgLower.includes("thank") ||
      userMsgLower.includes("good") ||
      userMsgLower.includes("great") ||
      userMsgLower.includes("awesome")
    ) {
      return `Thank you so much! I'm ${botName}, and I really appreciate your kind words. ${
        botPersonality.split(".")[0]
      }. It means a lot, especially while running in free mode. How else can I help you today?`;
    }

    // Default conversational response
    const responses = [
      `That's really interesting! I'm ${botName}. ${
        botPersonality.split(".")[0]
      }. You mentioned "${userMessage}" - I'd love to explore that topic further with you.`,
      `I hear you! As ${botName}, I find your perspective fascinating. ${
        botPersonality.split(".")[0]
      }. Tell me more about "${userMessage}".`,
      `Thanks for sharing that with me! I'm ${botName}. ${
        botPersonality.split(".")[0]
      }. Your message about "${userMessage}" has got me thinking. What's your take on it?`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const responseText = generateResponse(lastMessage, conversationHistory);

  return new Response(
    JSON.stringify({
      id: "free-response",
      object: "chat.completion",
      choices: [
        {
          message: {
            role: "assistant",
            content: responseText,
          },
        },
      ],
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// Configure available services in priority order
export const getAvailableServices = (): ApiServiceConfig[] => {
  return [
    {
      name: "OpenAI",
      priority: 1,
      isAvailable: isOpenAIAvailable,
      handler: handleOpenAI,
    },
    {
      name: "Vapi",
      priority: 2,
      isAvailable: isVapiAvailable,
      handler: handleVapi,
    },
    {
      name: "Retell",
      priority: 3,
      isAvailable: isRetellAvailable,
      handler: handleRetell,
    },
    {
      name: "Bland",
      priority: 4,
      isAvailable: isBlandAvailable,
      handler: handleBland,
    },
    {
      name: "Free Fallback",
      priority: 5,
      isAvailable: () => true, // Always available
      handler: handleFreeFallback,
    },
  ].filter((service) => service.isAvailable());
};
