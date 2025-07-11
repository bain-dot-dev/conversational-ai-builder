async function testChatAPI() {
  try {
    console.log("Testing chat API with fallback services...");

    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello, how are you?" }],
        botPersonality: "You are a helpful and friendly assistant.",
        botName: "TestBot",
      }),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers));

    if (response.body) {
      const reader = response.body.getReader();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        result += chunk;
        console.log("Received chunk:", chunk);
      }

      console.log("Final result:", result);
    } else {
      const text = await response.text();
      console.log("Response text:", text);
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testChatAPI();
