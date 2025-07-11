"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  Volume2,
  VolumeX,
  Bot,
  User,
  Loader2,
  AlertCircle,
  Clock,
  Settings,
} from "lucide-react";
import type { AIBot } from "@/app/page";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BotChatProps {
  bot: AIBot;
  onBack: () => void;
}

export default function BotChat({ bot }: BotChatProps) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [currentService, setCurrentService] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>("auto");
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [isFailingOver, setIsFailingOver] = useState(false);
  // const [debugMode, setDebugMode] = useState(false);
  const [lastSpokenMessageId, setLastSpokenMessageId] = useState<string | null>(
    null
  );

  // Check current service status and available services
  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        setCurrentService(data.primaryService);
        setAvailableServices(data.availableServices || []);
      })
      .catch(() => setCurrentService("Unknown"));
  }, []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error: chatError,
  } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Hello! I'm ${bot.name}. ${
          bot.personality.split(".")[0]
        }. How can I help you today?`,
      },
    ],
    body: {
      botPersonality: bot.personality,
      botName: bot.name,
      preferredService: selectedService,
    },
    onError: (error) => {
      console.error("Chat error:", error);

      // Clear any existing errors first
      setError(null);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Check which service is currently being used for better error messages
      const serviceSpecificMessage = currentService
        ? `Error with ${currentService} service: `
        : "API error: ";

      if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
        setIsRateLimited(true);
        setError(
          `${serviceSpecificMessage}Rate limit exceeded. Please wait a moment before sending another message.`
        );
        setTimeout(() => {
          setIsRateLimited(false);
          setError(null);
        }, 60000); // Clear rate limit after 1 minute
      } else if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("504")
      ) {
        setIsFailingOver(true);
        setError(
          `${serviceSpecificMessage}Service is taking too long to respond. The system is automatically trying backup services. Please try again in a moment.`
        );
        setTimeout(() => {
          setError(null);
          setIsFailingOver(false);
        }, 10000); // Clear timeout error after 10 seconds
      } else if (
        errorMessage.includes("quota") ||
        errorMessage.includes("402")
      ) {
        setError(
          `${serviceSpecificMessage}Quota exceeded. Please check your account usage and billing.`
        );
      } else if (
        errorMessage.includes("invalid_api_key") ||
        errorMessage.includes("401")
      ) {
        setError(
          `${serviceSpecificMessage}Invalid API key. Please check your configuration.`
        );
      } else if (
        errorMessage.includes("not configured") ||
        errorMessage.includes("500")
      ) {
        setError(
          `${serviceSpecificMessage}Service not configured. Please check your API keys in .env.local and restart the server.`
        );
      } else {
        setError(
          `${serviceSpecificMessage}An error occurred. Please try again. Current service: ${
            currentService || "Unknown"
          }. Error details: ${errorMessage}`
        );
      }
    },
  });

  const speakMessage = useCallback(
    (text: string) => {
      console.log("🎤 speakMessage called - isVoiceEnabled:", isVoiceEnabled);

      // CRITICAL: Don't speak if voice is disabled
      if (!isVoiceEnabled) {
        console.log("🔇 Voice is disabled, not speaking");
        return;
      }

      // Prevent empty or very short messages
      if (!text || text.trim().length < 2) {
        console.log("🔇 Text too short or empty, not speaking");
        return;
      }

      if (isSpeaking) {
        console.log("🔊 Already speaking, canceling previous");
        speechSynthesis.cancel();
        setIsSpeaking(false);
      }

      console.log("✅ Starting speech synthesis for text:", text.slice(0, 50));
      const utterance = new SpeechSynthesisUtterance(text);

      // Apply bot's voice settings
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(
        (v) => v.name === bot.voiceSettings.voice
      );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = bot.voiceSettings.rate;
      utterance.pitch = bot.voiceSettings.pitch;
      utterance.volume = bot.voiceSettings.volume;

      utterance.onstart = () => {
        console.log("🔊 Speech started");
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        console.log("🔇 Speech ended");
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
      };
      utterance.onerror = (error) => {
        console.log("❌ Speech error:", error);
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
      };

      currentUtteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    },
    [bot.voiceSettings, isSpeaking, isVoiceEnabled]
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Speak the latest assistant message if voice is enabled
    const lastMessage = messages[messages.length - 1];
    const messagePreview = lastMessage?.content?.slice(0, 50) || "No content";

    console.log(
      "📢 Message effect - isVoiceEnabled:",
      isVoiceEnabled,
      "lastMessage ID:",
      lastMessage?.id,
      "lastMessage role:",
      lastMessage?.role,
      "lastMessage preview:",
      messagePreview,
      "total messages:",
      messages.length
    );

    // More strict conditions to prevent loops
    if (
      lastMessage &&
      lastMessage.role === "assistant" &&
      isVoiceEnabled &&
      lastMessage.id !== "welcome" &&
      lastMessage.id !== lastSpokenMessageId &&
      lastMessage.content &&
      lastMessage.content.trim().length > 0
    ) {
      console.log("🎯 Calling speakMessage for message:", lastMessage.id);
      setLastSpokenMessageId(lastMessage.id);
      speakMessage(lastMessage.content);
    } else {
      console.log("❌ Not speaking - conditions not met:", {
        hasLastMessage: !!lastMessage,
        isAssistant: lastMessage?.role === "assistant",
        isVoiceEnabled,
        notWelcome: lastMessage?.id !== "welcome",
        notAlreadySpoken: lastMessage?.id !== lastSpokenMessageId,
        hasContent: !!lastMessage?.content?.trim(),
      });
    }
  }, [messages, isVoiceEnabled, speakMessage, lastSpokenMessageId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleVoice = () => {
    console.log(
      "🔄 Toggling voice from",
      isVoiceEnabled,
      "to",
      !isVoiceEnabled
    );

    // Always stop speaking when toggling voice
    if (isSpeaking) {
      console.log("🛑 Stopping speech before toggle");
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Reset spoken message tracking when toggling voice
    setLastSpokenMessageId(null);
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  const stopSpeaking = () => {
    console.log("🛑 Stop button clicked");
    speechSynthesis.cancel();
    setIsSpeaking(false);
    if (currentUtteranceRef.current) {
      currentUtteranceRef.current = null;
    }
    // Reset spoken message tracking when manually stopping
    setLastSpokenMessageId(null);
  };

  // Test function to verify voice works
  // const testVoice = () => {
  //   console.log("🧪 Testing voice - isVoiceEnabled:", isVoiceEnabled);
  //   if (isVoiceEnabled) {
  //     speakMessage("Voice test - I can speak!");
  //   } else {
  //     console.log("Voice is disabled, not speaking");
  //   }
  // };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-indigo-600" />
              <div>
                <CardTitle>{bot.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">{bot.description}</p>
                  {currentService && (
                    <Badge
                      variant={
                        currentService === "OpenAI" ? "default" : "outline"
                      }
                      className="text-xs"
                    >
                      {currentService === "Free Fallback"
                        ? "Free"
                        : currentService}
                    </Badge>
                  )}
                  {isFailingOver && (
                    <Badge
                      variant="secondary"
                      className="text-xs animate-pulse"
                    >
                      Switching Service...
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Service Selection */}
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <Select
                  value={selectedService}
                  onValueChange={setSelectedService}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="API Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    {availableServices.map((service) => (
                      <SelectItem key={service} value={service.toLowerCase()}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Badge variant={isVoiceEnabled ? "default" : "secondary"}>
                Voice {isVoiceEnabled ? "On" : "Off"}
              </Badge>
              {/* <Badge variant="outline" className="text-xs">
                Debug: V={isVoiceEnabled ? "✅" : "❌"} | S=
                {isSpeaking ? "🔊" : "🔇"} | Last:{" "}
                {lastSpokenMessageId || "None"}
              </Badge> */}
              {/* <Button
                size="sm"
                variant="outline"
                onClick={() => setDebugMode(!debugMode)}
                title="Toggle debug mode"
                className="text-xs"
              >
                {debugMode ? "Debug On" : "Debug Off"}
              </Button> */}
              {/* {debugMode && (
                <Badge variant="outline" className="text-xs">
                  Service: {selectedService} | Available:{" "}
                  {availableServices.length}
                </Badge>
              )} */}
              <Button
                size="sm"
                variant="outline"
                onClick={toggleVoice}
                title={`Turn voice ${isVoiceEnabled ? "off" : "on"}`}
              >
                {isVoiceEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              {/* <Button
                size="sm"
                variant="outline"
                onClick={testVoice}
                title="Test voice"
                className="text-xs"
              >
                Test
              </Button> */}
              {isSpeaking && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={stopSpeaking}
                  title="Stop speaking"
                >
                  Stop
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {(error || chatError) && (
          <Alert className="w-auto mx-6 mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error || chatError?.message}
            </AlertDescription>
          </Alert>
        )}

        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user" ? "bg-blue-500" : "bg-indigo-500"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="rounded-lg px-4 py-2 bg-gray-100 text-gray-900">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>
                        {isFailingOver
                          ? "Switching to backup service..."
                          : selectedService !== "auto"
                          ? `Using ${selectedService}...`
                          : "Thinking..."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={`Message ${bot.name}...`}
              disabled={isLoading || isRateLimited}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim() || isRateLimited}
            >
              {isRateLimited ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          {isRateLimited && (
            <p className="text-xs text-gray-500 mt-1">
              Rate limited. Please wait before sending another message.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
