// Test endpoint to simulate service timeouts and failures
// This endpoint can be used to test the timeout-based failover functionality

export async function POST(req: Request) {
  try {
    const {
      simulateTimeout,
      simulateFailure,
      delayMs = 5000,
    } = await req.json();

    console.log("Test endpoint called with:", {
      simulateTimeout,
      simulateFailure,
      delayMs,
    });

    if (simulateTimeout) {
      // Simulate a timeout by delaying longer than the service timeout
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return new Response(
        JSON.stringify({ message: "This should have timed out" }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (simulateFailure) {
      // Simulate a service failure
      throw new Error("Simulated service failure");
    }

    // Normal response
    return new Response(
      JSON.stringify({
        message: "Test endpoint working normally",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Test endpoint error:", error);
    return new Response(
      JSON.stringify({
        error: "Test endpoint error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
