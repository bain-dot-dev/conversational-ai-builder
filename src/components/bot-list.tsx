"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Edit, Trash2, Bot } from "lucide-react"
import type { AIBot } from "@/app/page"

interface BotListProps {
  bots: AIBot[]
  onEditBot: (bot: AIBot) => void
  onChatWithBot: (bot: AIBot) => void
  onDeleteBot: (botId: string) => void
}

export default function BotList({ bots, onEditBot, onChatWithBot, onDeleteBot }: BotListProps) {
  if (bots.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bot className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No AI Bots Yet</h3>
          <p className="text-gray-400 text-center">Create your first AI bot to get started with conversational AI</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bots.map((bot) => (
        <Card key={bot.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-600" />
              {bot.name}
            </CardTitle>
            {bot.description && <p className="text-sm text-gray-600">{bot.description}</p>}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-700 line-clamp-3">{bot.personality}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Voice: {bot.voiceSettings.voice === "default" ? "Default" : bot.voiceSettings.voice.split(" ")[0]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Created: {new Date(bot.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => onChatWithBot(bot)} className="flex-1">
                <MessageSquare className="h-4 w-4 mr-1" />
                Chat
              </Button>
              <Button size="sm" variant="outline" onClick={() => onEditBot(bot)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this bot?")) {
                    onDeleteBot(bot.id)
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
