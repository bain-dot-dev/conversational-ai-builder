const testChatApi = async () => {
  try {
    console.log("Testing chat API...");

    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello, say hi back!" }],
        botPersonality: "You are a helpful assistant",
        botName: "TestBot",
      }),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      return;
    }

    // Check if it's a streaming response
    const contentType = response.headers.get("content-type");
    console.log("Content-Type:", contentType);

    if (contentType && contentType.includes("text/plain")) {
      // This is likely a streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        console.error("No reader available");
        return;
      }

      let result = "";
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        result += chunk;
        chunkCount++;
        console.log(`Chunk ${chunkCount}:`, chunk);
      }

      console.log("Final result:", result);
      console.log("Total chunks received:", chunkCount);
    } else {
      // Regular JSON response
      const data = await response.json();
      console.log("JSON response:", data);
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
};

// Run the test
testChatApi();
