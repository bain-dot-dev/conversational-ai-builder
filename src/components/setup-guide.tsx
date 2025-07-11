"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Key,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

export default function SetupGuide() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [apiStatus, setApiStatus] = useState<{
    configured: boolean;
    availableServices: string[];
    serviceStatus: {
      openai: boolean;
      vapi: boolean;
      retell: boolean;
      bland: boolean;
    };
    primaryService: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => setApiStatus(data))
      .catch(() => setApiStatus(null));
  }, []);

  // Show the guide expanded by default if API key is not configured
  useEffect(() => {
    if (
      apiStatus &&
      (!apiStatus.configured || apiStatus.availableServices.length === 0)
    ) {
      setIsExpanded(true);
    }
  }, [apiStatus]);

  return (
    <Card
      className={`mb-6 ${
        apiStatus?.configured
          ? "border-green-200 bg-green-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 ${
            apiStatus?.configured ? "text-green-900" : "text-red-900"
          }`}
        >
          <Key className="h-5 w-5" />
          AI API Setup
          {apiStatus?.configured ? (
            <Badge variant="default" className="ml-2 bg-green-600">
              ✓ {apiStatus.primaryService} Active
            </Badge>
          ) : (
            <Badge variant="destructive" className="ml-2">
              ⚠ Setup Required
            </Badge>
          )}
        </CardTitle>
        {apiStatus && !apiStatus.configured && (
          <div className="text-sm text-red-800 font-medium">
            Please configure at least one AI API service to use this
            application.
          </div>
        )}
        {apiStatus && apiStatus.configured && (
          <div className="text-sm text-green-800 font-medium">
            Using {apiStatus.primaryService} •{" "}
            {apiStatus.availableServices.length} service(s) available
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-fit ${
            apiStatus?.configured
              ? "text-green-700 hover:text-green-900"
              : "text-red-700 hover:text-red-900"
          }`}
        >
          {isExpanded ? "Hide" : "Show"} Setup Instructions
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {apiStatus && !apiStatus.configured && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>No API Services Configured:</strong> Please add at least
                one API key to your .env.local file.
              </AlertDescription>
            </Alert>
          )}

          {apiStatus && apiStatus.configured && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Services Available:</strong>{" "}
                {apiStatus.availableServices.join(", ")} • Primary:{" "}
                {apiStatus.primaryService}
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This application supports multiple AI services with free tiers.
              Choose one or configure multiple for automatic fallback.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-semibold text-blue-900">
              Available AI Services:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* OpenAI Service */}
              <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className={`h-4 w-4 ${
                      apiStatus?.serviceStatus.openai
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <strong>OpenAI (GPT-3.5)</strong>
                  {apiStatus?.serviceStatus.openai && (
                    <Badge className="bg-green-600">Active</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  $5 free credits • Best quality responses
                </p>
                <a
                  href="https://platform.openai.com/account/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  Get API Key <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Vapi Service */}
              <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className={`h-4 w-4 ${
                      apiStatus?.serviceStatus.vapi
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <strong>Vapi (Voice AI)</strong>
                  {apiStatus?.serviceStatus.vapi && (
                    <Badge className="bg-green-600">Active</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  Free tier available • Voice-optimized
                </p>
                <a
                  href="https://vapi.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  Get API Key <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Retell Service */}
              <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className={`h-4 w-4 ${
                      apiStatus?.serviceStatus.retell
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <strong>Retell AI</strong>
                  {apiStatus?.serviceStatus.retell && (
                    <Badge className="bg-green-600">Active</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  Free tier available • Conversational AI
                </p>
                <a
                  href="https://retellai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  Get API Key <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Bland Service */}
              <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className={`h-4 w-4 ${
                      apiStatus?.serviceStatus.bland
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <strong>Bland AI</strong>
                  {apiStatus?.serviceStatus.bland && (
                    <Badge className="bg-green-600">Active</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  Free tier available • Phone calling AI
                </p>
                <a
                  href="https://bland.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  Get API Key <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <h5 className="font-medium">Setup Instructions:</h5>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>1. Create OpenAI Account:</strong>
                  <br />
                  <a
                    href="https://platform.openai.com/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Sign up at OpenAI Platform{" "}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>2. Get API Key:</strong>
                  <br />
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Create API Key <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>3. Add to Environment:</strong>
                  <br />
                  Create{" "}
                  <code className="bg-gray-200 px-1 rounded">
                    .env.local
                  </code>{" "}
                  file with:
                  <br />
                  <code className="bg-gray-100 px-2 py-1 rounded block mt-1 font-mono text-xs">
                    OPENAI_API_KEY=your_api_key_here
                  </code>
                </div>
              </div>
            </div>

            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Free Tier Limits:</strong>
                <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                  <li>$5 in free credits (expires after 3 months)</li>
                  <li>Rate limits: 3 requests/minute, 200 requests/day</li>
                  <li>Access to GPT-3.5 Turbo model</li>
                  <li>Perfect for testing and small projects</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h5 className="font-medium text-green-900 mb-2">
                💡 Pro Tips for Free Tier:
              </h5>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• Keep conversations concise to save tokens</li>
                <li>• Wait between requests if you hit rate limits</li>
                <li>• Monitor usage in your OpenAI dashboard</li>
                <li>
                  • Consider upgrading to pay-as-you-go for production use
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
