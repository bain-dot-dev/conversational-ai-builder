async function testBothScenarios() {
  console.log("Testing chat API scenarios...");

  // Test 1: Simple message
  try {
    const response1 = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hi" }],
        botPersonality: "Friendly assistant",
        botName: "TestBot",
      }),
    });

    console.log("Test 1 - Status:", response1.status);

    if (response1.body) {
      const reader = response1.body.getReader();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
      }

      console.log(
        "Test 1 - Success:",
        result.includes("Hi") ||
          result.includes("Hello") ||
          result.includes("TestBot")
      );
    }
  } catch (error) {
    console.error("Test 1 failed:", error);
  }

  // Wait a moment
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 2: Longer message
  try {
    const response2 = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Tell me a joke" }],
        botPersonality: "Funny comedian",
        botName: "JokeBot",
      }),
    });

    console.log("Test 2 - Status:", response2.status);

    if (response2.body) {
      const reader = response2.body.getReader();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
      }

      console.log(
        "Test 2 - Success:",
        result.includes("JokeBot") ||
          result.includes("joke") ||
          result.includes("funny")
      );
    }
  } catch (error) {
    console.error("Test 2 failed:", error);
  }
}

testBothScenarios();
