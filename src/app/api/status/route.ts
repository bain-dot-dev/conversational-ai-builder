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
