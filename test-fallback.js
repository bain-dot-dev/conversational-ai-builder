// Quick test script to verify the fallback system
async function testFallback() {
  try {
    const response = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello, how are you?" }],
        botPersonality: "You are a helpful assistant.",
        botName: "TestBot",
      }),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (response.headers.get("Content-Type")?.includes("text/plain")) {
      // Streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
      }

      console.log("Streaming result:", result);
    } else {
      // JSON response
      const data = await response.json();
      console.log("JSON result:", data);
    }
  } catch (error) {
    console.error("Test error:", error);
  }
}

testFallback();
