"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Play, Volume2 } from "lucide-react";
import type { AIBot } from "@/app/page";

interface BotBuilderProps {
  bot?: AIBot | null;
  onSave: (bot: AIBot) => void;
  onCancel: () => void;
}

export default function BotBuilder({ bot, onSave, onCancel }: BotBuilderProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    personality: "",
    voiceSettings: {
      voice: "default",
      rate: 1,
      pitch: 1,
      volume: 1,
    },
  });

  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    // Pre-fill form if editing existing bot
    if (bot) {
      setFormData({
        name: bot.name,
        description: bot.description,
        personality: bot.personality,
        voiceSettings: bot.voiceSettings,
      });
    }
  }, [bot]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVoiceSettingChange = (
    setting: string,
    value: number | string
  ) => {
    setFormData((prev) => ({
      ...prev,
      voiceSettings: {
        ...prev.voiceSettings,
        [setting]: value,
      },
    }));
  };

  const testVoice = () => {
    if (isTestingVoice) return;

    setIsTestingVoice(true);
    const utterance = new SpeechSynthesisUtterance(
      `Hello! I'm ${formData.name || "your AI assistant"}. ${
        formData.personality || "I'm here to help you with anything you need."
      }`
    );

    const selectedVoice = availableVoices.find(
      (v) => v.name === formData.voiceSettings.voice
    );
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = formData.voiceSettings.rate;
    utterance.pitch = formData.voiceSettings.pitch;
    utterance.volume = formData.voiceSettings.volume;

    utterance.onend = () => setIsTestingVoice(false);
    utterance.onerror = () => setIsTestingVoice(false);

    speechSynthesis.speak(utterance);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.personality.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    const newBot: AIBot = {
      id: bot?.id || Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      personality: formData.personality.trim(),
      voiceSettings: formData.voiceSettings,
      createdAt: bot?.createdAt || new Date().toISOString(),
    };

    onSave(newBot);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            {bot ? "Edit AI Bot" : "Create New AI Bot"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Bot Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Customer Support Assistant"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of your bot"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </div>
          </div>

          {/* Personality */}
          <div className="space-y-2">
            <Label htmlFor="personality">Personality & Instructions *</Label>
            <Textarea
              id="personality"
              placeholder="Describe how your bot should behave, its tone, expertise areas, and any specific instructions..."
              className="min-h-[120px]"
              value={formData.personality}
              onChange={(e) => handleInputChange("personality", e.target.value)}
            />
          </div>

          {/* Voice Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Voice Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Voice</Label>
                  <Select
                    value={formData.voiceSettings.voice}
                    onValueChange={(value) =>
                      handleVoiceSettingChange("voice", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      {availableVoices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testVoice}
                    disabled={isTestingVoice}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Play className="h-4 w-4" />
                    {isTestingVoice ? "Playing..." : "Test Voice"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Speech Rate: {formData.voiceSettings.rate}</Label>
                  <Slider
                    value={[formData.voiceSettings.rate]}
                    onValueChange={([value]) =>
                      handleVoiceSettingChange("rate", value)
                    }
                    min={0.5}
                    max={2}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pitch: {formData.voiceSettings.pitch}</Label>
                  <Slider
                    value={[formData.voiceSettings.pitch]}
                    onValueChange={([value]) =>
                      handleVoiceSettingChange("pitch", value)
                    }
                    min={0.5}
                    max={2}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Volume: {formData.voiceSettings.volume}</Label>
                  <Slider
                    value={[formData.voiceSettings.volume]}
                    onValueChange={([value]) =>
                      handleVoiceSettingChange("volume", value)
                    }
                    min={0.1}
                    max={1}
                    step={0.1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {bot ? "Update Bot" : "Create Bot"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
