"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Bot } from "lucide-react"
import BotBuilder from "@/components/bot-builder"
import BotChat from "@/components/bot-chat"
import BotList from "@/components/bot-list"
import SetupGuide from "@/components/setup-guide"

export interface AIBot {
  id: string
  name: string
  description: string
  personality: string
  voiceSettings: {
    voice: string
    rate: number
    pitch: number
    volume: number
  }
  createdAt: string
}

export default function Home() {
  const [currentView, setCurrentView] = useState<"list" | "builder" | "chat">("list")
  const [selectedBot, setSelectedBot] = useState<AIBot | null>(null)
  const [bots, setBots] = useState<AIBot[]>([])

  const handleCreateBot = () => {
    setSelectedBot(null)
    setCurrentView("builder")
  }

  const handleEditBot = (bot: AIBot) => {
    setSelectedBot(bot)
    setCurrentView("builder")
  }

  const handleChatWithBot = (bot: AIBot) => {
    setSelectedBot(bot)
    setCurrentView("chat")
  }

  const handleSaveBot = (bot: AIBot) => {
    setBots((prev) => {
      const existing = prev.find((b) => b.id === bot.id)
      if (existing) {
        return prev.map((b) => (b.id === bot.id ? bot : b))
      }
      return [...prev, bot]
    })
    setCurrentView("list")
  }

  const handleDeleteBot = (botId: string) => {
    setBots((prev) => prev.filter((b) => b.id !== botId))
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedBot(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">AI Bot Builder</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create intelligent conversational AI bots with custom personalities, text responses, and voice synthesis
            capabilities using OpenAI&apos;s free tier.
          </p>
        </div>

        {/* Setup Guide */}
        <SetupGuide />

        {/* Navigation */}
        {currentView !== "list" && (
          <div className="mb-6">
            <Button variant="outline" onClick={handleBackToList} className="flex items-center gap-2 bg-transparent">
              ← Back to Bots
            </Button>
          </div>
        )}

        {/* Main Content */}
        {currentView === "list" && (
          <div className="space-y-6">
            {/* Create New Bot Card */}
            <Card
              className="border-dashed border-2 border-indigo-300 hover:border-indigo-400 transition-colors cursor-pointer"
              onClick={handleCreateBot}
            >
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Plus className="h-12 w-12 text-indigo-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Create New AI Bot</h3>
                <p className="text-gray-500 text-center">
                  Build a custom conversational AI with unique personality and voice
                </p>
              </CardContent>
            </Card>

            {/* Bot List */}
            <BotList
              bots={bots}
              onEditBot={handleEditBot}
              onChatWithBot={handleChatWithBot}
              onDeleteBot={handleDeleteBot}
            />
          </div>
        )}

        {currentView === "builder" && (
          <BotBuilder bot={selectedBot} onSave={handleSaveBot} onCancel={handleBackToList} />
        )}

        {currentView === "chat" && selectedBot && <BotChat bot={selectedBot} onBack={handleBackToList} />}
      </div>
    </div>
  )
}
