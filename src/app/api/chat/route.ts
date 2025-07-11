import { getAvailableServices } from "@/lib/api-services";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, botPersonality, botName, preferredService } =
      await req.json();

    console.log("Received request:", {
      messagesCount: messages?.length,
      botName,
      firstMessage: messages?.[0]?.content,
      preferredService,
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
    const availableServices = getAvailableServices();

    if (availableServices.length === 0) {
      console.error("No API services configured");
      return new Response(
        JSON.stringify({
          error:
            "No API services are configured. Please add at least one API key (OpenAI, Vapi, Retell, or Bland) to your environment variables.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      "Available API services:",
      availableServices.map((s) => s.name).join(", ")
    );

    // Filter services based on preferred service
    let servicesToTry = availableServices;
    if (preferredService && preferredService !== "auto") {
      const preferredServiceFound = availableServices.find(
        (s) => s.name.toLowerCase() === preferredService.toLowerCase()
      );
      if (preferredServiceFound) {
        servicesToTry = [preferredServiceFound];
        console.log(`Using preferred service: ${preferredService}`);
      } else {
        console.log(
          `Preferred service ${preferredService} not available, using fallback`
        );
      }
    }

    // Try each service in priority order
    for (const service of servicesToTry) {
      try {
        console.log(`Attempting to use ${service.name} service`);
        const response = await service.handler(
          messages,
          botPersonality,
          botName
        );
        console.log(`${service.name} service completed successfully`);

        // For OpenAI, return the streaming response directly
        if (service.name === "OpenAI") {
          return response;
        }

        // For fallback services, check if it's a JSON response and convert it to a stream
        const contentType = response.headers.get("Content-Type") || "";

        if (contentType.includes("application/json")) {
          try {
            // Clone the response to read the JSON
            const clonedResponse = response.clone();
            const jsonData = await clonedResponse.json();
            const content =
              jsonData.choices?.[0]?.message?.content ||
              "No response available";

            console.log(
              `Converting ${
                service.name
              } JSON response to streaming format. Content: "${content.substring(
                0,
                100
              )}..."`
            );

            // Create a simple streaming response compatible with AI SDK
            const encoder = new TextEncoder();

            const stream = new ReadableStream({
              start(controller) {
                try {
                  console.log(`Creating stream for ${service.name}`);

                  // Create data chunks in the correct AI SDK format
                  const textChunk = `0:"${content
                    .replace(/"/g, '\\"')
                    .replace(/\n/g, "\\n")}"`;
                  const finishChunk = `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":1}}`;
                  const errorChunk = `e:null`;

                  // Send each chunk with proper line endings
                  controller.enqueue(encoder.encode(textChunk + "\n"));
                  controller.enqueue(encoder.encode(finishChunk + "\n"));
                  controller.enqueue(encoder.encode(errorChunk + "\n"));

                  console.log(`Finished streaming for ${service.name}`);
                  controller.close();
                } catch (error) {
                  console.error(
                    `Error in stream controller for ${service.name}:`,
                    error
                  );
                  controller.error(error);
                }
              },
            });

            console.log(
              `Successfully created streaming response for ${service.name}`
            );

            return new Response(stream, {
              headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
              },
            });
          } catch (conversionError) {
            console.error(
              `Error converting ${service.name} response to streaming:`,
              conversionError
            );
            throw conversionError;
          }
        }

        return response;
      } catch (serviceError: unknown) {
        const errorMessage =
          serviceError instanceof Error
            ? serviceError.message
            : String(serviceError);
        console.error(`${service.name} service failed:`, errorMessage);

        // If this is the last service, we'll throw the error
        if (service === servicesToTry[servicesToTry.length - 1]) {
          throw serviceError;
        }

        // Otherwise, continue to the next service
        console.log(`Trying next service...`);
      }
    }
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
