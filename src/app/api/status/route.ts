import {
  getAvailableServices,
  isOpenAIAvailable,
  isVapiAvailable,
  isRetellAvailable,
  isBlandAvailable,
} from "@/lib/api-services";

export async function GET() {
  const availableServices = getAvailableServices();

  return Response.json({
    configured: availableServices.length > 0,
    availableServices: availableServices.map((s) => s.name),
    serviceStatus: {
      openai: isOpenAIAvailable(),
      vapi: isVapiAvailable(),
      retell: isRetellAvailable(),
      bland: isBlandAvailable(),
    },
    primaryService: availableServices[0]?.name || "none",
  });
}



// - Implement service selection dropdown in chat interface
// - Add real-time service status monitoring and display
// - Show current active service with badge indicators
// - Enable users to prefer specific services or use auto-selection
// - Add comprehensive setup guide with service status indicators


