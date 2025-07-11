async function testServiceSelection() {
  console.log("🎯 Testing Service Selection Feature...\n");

  // Test 1: Auto selection (default)
  console.log("1️⃣ Testing Auto Selection...");
  await testWithService("auto");

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 2: Force Vapi
  console.log("2️⃣ Testing Vapi Selection...");
  await testWithService("vapi");

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 3: Force Retell
  console.log("3️⃣ Testing Retell Selection...");
  await testWithService("retell");

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 4: Force OpenAI
  console.log("4️⃣ Testing OpenAI Selection...");
  await testWithService("openai");

  console.log("\n🏁 Service Selection Testing Complete!");
}

async function testWithService(preferredService) {
  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: `Hello from ${preferredService}` }],
        botPersonality: "You are a helpful assistant.",
        botName: "ServiceBot",
        preferredService: preferredService,
      }),
    });

    console.log(`${preferredService.toUpperCase()} Status:`, response.status);

    if (response.body) {
      const reader = response.body.getReader();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
      }

      if (
        result.includes("ServiceBot") ||
        result.includes("hello") ||
        result.includes("Hello")
      ) {
        console.log(`✅ ${preferredService.toUpperCase()}: SUCCESS`);
      } else {
        console.log(`❌ ${preferredService.toUpperCase()}: ERROR - ${result}`);
      }
    }
  } catch (error) {
    console.log(
      `❌ ${preferredService.toUpperCase()}: CONNECTION ERROR -`,
      error.message
    );
  }
}

testServiceSelection();
