"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, DollarSign, MessageSquare } from "lucide-react";

export default function UsageMonitor() {
  const [usage, setUsage] = useState({
    messagesThisSession: 0,
    estimatedCost: 0,
    dailyMessages: 0,
  });

  useEffect(() => {
    // Load usage from localStorage
    const savedUsage = localStorage.getItem("ai-bot-usage");
    if (savedUsage) {
      setUsage(JSON.parse(savedUsage));
    }
  }, []);

  const updateUsage = useCallback(() => {
    const newUsage = {
      ...usage,
      messagesThisSession: usage.messagesThisSession + 1,
      estimatedCost: usage.estimatedCost + 0.002, // Rough estimate for GPT-3.5-turbo
      dailyMessages: usage.dailyMessages + 1,
    };
    setUsage(newUsage);
    localStorage.setItem("ai-bot-usage", JSON.stringify(newUsage));
  }, [usage]);

  // Expose updateUsage function globally for other components to use
  useEffect(() => {
    (
      window as typeof window & { updateAIUsage?: typeof updateUsage }
    ).updateAIUsage = updateUsage;
  }, [updateUsage]);

  const dailyLimit = 200; // Free tier daily limit
  const dailyProgress = (usage.dailyMessages / dailyLimit) * 100;

  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <Activity className="h-5 w-5" />
          Usage Monitor
          <Badge
            variant="outline"
            className="ml-2 text-green-700 border-green-300"
          >
            Free Tier
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Session Messages</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {usage.messagesThisSession}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Estimated Cost</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${usage.estimatedCost.toFixed(4)}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Daily Usage</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {usage.dailyMessages}/{dailyLimit}
            </div>
            <Progress value={dailyProgress} className="mt-2 h-2" />
          </div>
        </div>

        {dailyProgress > 80 && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ You&apos;re approaching the daily free tier limit. Consider
              upgrading for unlimited usage.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
