import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

interface ChatBotSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voiceEnabled: boolean;
  onVoiceEnabledChange: (enabled: boolean) => void;
  voiceGender: "male" | "female";
  onVoiceGenderChange: (gender: "male" | "female") => void;
  voiceRate: number;
  onVoiceRateChange: (rate: number) => void;
  voicePitch: number;
  onVoicePitchChange: (pitch: number) => void;
}

export function ChatBotSettings({
  open,
  onOpenChange,
  voiceEnabled,
  onVoiceEnabledChange,
  voiceGender,
  onVoiceGenderChange,
  voiceRate,
  onVoiceRateChange,
  voicePitch,
  onVoicePitchChange,
}: ChatBotSettingsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chatbot Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Voice Enable/Disable */}
          <div className="flex items-center justify-between">
            <Label htmlFor="voice-enabled" className="text-sm font-medium">
              Enable Voice Response
            </Label>
            <Switch
              id="voice-enabled"
              checked={voiceEnabled}
              onCheckedChange={onVoiceEnabledChange}
            />
          </div>

          {voiceEnabled && (
            <>
              {/* Voice Gender Selection */}
              <div className="space-y-2">
                <Label htmlFor="voice-gender" className="text-sm font-medium">
                  Voice Gender
                </Label>
                <Select value={voiceGender} onValueChange={onVoiceGenderChange as any}>
                  <SelectTrigger id="voice-gender">
                    <SelectValue placeholder="Select voice gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male Voice</SelectItem>
                    <SelectItem value="female">Female Voice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Rate */}
              <div className="space-y-2">
                <Label htmlFor="voice-rate" className="text-sm font-medium">
                  Speech Rate: {voiceRate.toFixed(1)}x
                </Label>
                <Slider
                  id="voice-rate"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[voiceRate]}
                  onValueChange={([value]) => onVoiceRateChange(value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Adjust how fast the voice speaks
                </p>
              </div>

              {/* Voice Pitch */}
              <div className="space-y-2">
                <Label htmlFor="voice-pitch" className="text-sm font-medium">
                  Voice Pitch: {voicePitch.toFixed(1)}
                </Label>
                <Slider
                  id="voice-pitch"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[voicePitch]}
                  onValueChange={([value]) => onVoicePitchChange(value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Adjust the pitch of the voice
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}