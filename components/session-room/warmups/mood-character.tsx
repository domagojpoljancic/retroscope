"use client";

import { useMemo, useState } from "react";
import { Check, Sparkles } from "lucide-react";

import { useRoom } from "@/components/session-room/session-room-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { getParticipantContext } from "@/lib/participant-context";
import { getCharacterPartsByCategory } from "@/lib/warmup-content";
import { cn } from "@/lib/utils";
import type {
  CharacterBuilderPart,
  MoodCharacterWarmupResponseData,
} from "@/types";

function partEmoji(id: string | undefined): string {
  if (!id) {
    return "";
  }
  return (
    getCharacterPartsByCategory("face")
      .concat(getCharacterPartsByCategory("accessory"))
      .concat(getCharacterPartsByCategory("background"))
      .find((part) => part.id === id)?.emoji ?? ""
  );
}

export function MoodCharacterWarmup() {
  const { session, store, viewer, participantName } = useRoom();

  const faces = getCharacterPartsByCategory("face");
  const accessories = getCharacterPartsByCategory("accessory");
  const backgrounds = getCharacterPartsByCategory("background");

  const existing = viewer.participantId
    ? store.warmupResponses.find(
        (response) =>
          response.sessionId === session.id &&
          response.participantId === viewer.participantId,
      ) ?? null
    : null;
  const existingData =
    existing && existing.response.type === "mood_character"
      ? existing.response
      : null;

  const [face, setFace] = useState(existingData?.characterParts.face ?? faces[0].id);
  const [accessory, setAccessory] = useState(
    existingData?.characterParts.accessory ?? accessories[0].id,
  );
  const [background, setBackground] = useState(
    existingData?.characterParts.background ?? backgrounds[0].id,
  );
  const [moodLabel, setMoodLabel] = useState(existingData?.moodLabel ?? "");

  const responses = useMemo(
    () =>
      store.warmupResponses.filter(
        (response) =>
          response.sessionId === session.id &&
          response.response.type === "mood_character",
      ),
    [store.warmupResponses, session.id],
  );

  const submit = () => {
    if (!viewer.participantId) {
      return;
    }
    const data: MoodCharacterWarmupResponseData = {
      type: "mood_character",
      characterParts: { face, accessory, background },
      moodLabel: moodLabel.trim() || undefined,
    };
    const ctx = getParticipantContext(session.id);
    if (!ctx) {
      return;
    }
    void api.submitWarmupResponse(
      {
        sessionId: session.id,
        participantId: viewer.participantId,
        warmupType: "mood_character",
        response: data,
      },
      ctx,
    );
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="scope-frame overflow-hidden">
        <CardContent className="space-y-4 p-4">
          {viewer.participantId ? (
            <>
              <div className="flex items-center justify-between">
                <span className="vhs-label">
                  <Sparkles className="size-3" />
                  Mood Station
                </span>
                <span className="retro-meta">Build your avatar</span>
              </div>
              <div className="flex items-center justify-center">
                <div
                  className="retro-gradient-panel scanlines relative flex size-40 items-center justify-center rounded-2xl text-6xl shadow-md"
                  title="Character preview"
                >
                  <span className="absolute inset-[6px] rounded-xl border border-white/30" />
                  <span className="absolute left-3 top-3 text-xl">
                    {partEmoji(background)}
                  </span>
                  <span className="relative drop-shadow-sm">{partEmoji(face)}</span>
                  <span className="absolute bottom-3 right-3 text-xl">
                    {partEmoji(accessory)}
                  </span>
                </div>
              </div>

              <PartSelector
                label="Expression"
                parts={faces}
                value={face}
                onChange={setFace}
              />
              <PartSelector
                label="Accessory"
                parts={accessories}
                value={accessory}
                onChange={setAccessory}
              />
              <PartSelector
                label="Mood background"
                parts={backgrounds}
                value={background}
                onChange={setBackground}
              />

              <div className="space-y-2">
                <Label htmlFor="mood-label">Mood label (optional)</Label>
                <Input
                  id="mood-label"
                  placeholder="e.g. Cautiously optimistic"
                  value={moodLabel}
                  onChange={(event) => setMoodLabel(event.target.value)}
                />
              </div>

              <Button onClick={submit} className="w-full">
                {existingData ? (
                  <>
                    <Check />
                    Update my mood
                  </>
                ) : (
                  <>
                    <Sparkles />
                    Submit mood
                  </>
                )}
              </Button>
            </>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              You are observing. Switch to a participant to build a mood
              character.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Submitted moods</p>
            <span className="retro-meta">{responses.length} in</span>
          </div>
          {responses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No moods submitted yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {responses.map((response) => {
                const data = response.response;
                if (data.type !== "mood_character") {
                  return null;
                }
                return (
                  <div
                    key={response.id}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-3 text-center transition-shadow hover:shadow-sm"
                  >
                    <div className="retro-gradient-panel relative flex size-16 items-center justify-center rounded-xl text-3xl shadow-sm">
                      <span className="absolute left-1 top-1 text-sm">
                        {partEmoji(data.characterParts.background)}
                      </span>
                      <span>{partEmoji(data.characterParts.face)}</span>
                      <span className="absolute bottom-1 right-1 text-sm">
                        {partEmoji(data.characterParts.accessory)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Avatar
                        name={participantName(response.participantId)}
                        className="size-5 text-[9px]"
                      />
                      <span className="text-xs font-medium">
                        {participantName(response.participantId)}
                      </span>
                    </div>
                    {data.moodLabel ? (
                      <span className="text-xs text-muted-foreground">
                        “{data.moodLabel}”
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PartSelector({
  label,
  parts,
  value,
  onChange,
}: {
  label: string;
  parts: CharacterBuilderPart[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {parts.map((part) => (
          <button
            key={part.id}
            type="button"
            onClick={() => onChange(part.id)}
            title={part.label}
            aria-pressed={value === part.id}
            className={cn(
              "flex size-11 items-center justify-center rounded-xl border text-xl transition-all",
              value === part.id
                ? "scale-105 border-primary bg-primary/10 shadow-sm ring-2 ring-primary/40"
                : "border-border bg-background hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/40",
            )}
          >
            {part.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
