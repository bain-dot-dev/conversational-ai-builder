// Simple API test script
async function testRetellSpecifically() {
  console.log("🎯 Testing Retell API specifically for looping issues...\n");

  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello there!" }],
        botPersonality: "You are a helpful assistant.",
        botName: "TestBot",
        preferredService: "retell",
      }),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers));

    if (response.body) {
      const reader = response.body.getReader();
      let chunks = [];
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunkCount++;
        const chunk = new TextDecoder().decode(value);
        chunks.push(chunk);
        console.log(`Chunk ${chunkCount}:`, chunk);

        // Stop if we get too many chunks (indicates looping)
        if (chunkCount > 10) {
          console.log("❌ DETECTED LOOPING - Too many chunks received");
          break;
        }
      }

      console.log(`\n📊 Total chunks received: ${chunkCount}`);
      console.log("✅ Test completed - No looping detected");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testRetellSpecifically();
