async function finalTest() {
  try {
    console.log("Final test of fallback services...");

    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello!" }],
        botPersonality: "You are a helpful assistant.",
        botName: "AssistantBot",
      }),
    });

    console.log("Status:", response.status);

    if (response.body) {
      const reader = response.body.getReader();
      let chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        chunks.push(chunk);
      }

      const result = chunks.join("");
      console.log("Result:", result);

      // Check if it contains expected content
      if (result.includes("AssistantBot") || result.includes("Hello")) {
        console.log("✅ SUCCESS: Fallback services working correctly!");
      } else {
        console.log("❌ ISSUE: Unexpected response format");
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

finalTest();
