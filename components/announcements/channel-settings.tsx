"use client";

import { useActionState, useRef } from "react";

import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/form";
import { useActionToast } from "@/components/ui/toast";
import { updateChannelsAction } from "@/lib/actions/settings";
import type { AnnouncementChannels } from "@/lib/types";

const CHANNELS: Array<{ key: keyof AnnouncementChannels; label: string; description: string }> = [
  { key: "email", label: "Email Notifications", description: "Send announcements via email" },
  { key: "push", label: "Push Notifications", description: "Send mobile app notifications" },
  { key: "sms", label: "SMS Notifications", description: "Send text messages for urgent updates" },
];

export function ChannelSettings({ channels }: { channels: AnnouncementChannels }) {
  const [state, action] = useActionState(updateChannelsAction, null);
  useActionToast(state);

  return (
    <Card className="bg-panel" padding="md">
      <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Communication Settings</h3>
      <div className="space-y-4">
        {CHANNELS.map((channel) => (
          <ChannelRow key={channel.key} channel={channel} enabled={channels[channel.key]} action={action} />
        ))}
      </div>
    </Card>
  );
}

function ChannelRow({
  channel,
  enabled,
  action,
}: {
  channel: { key: keyof AnnouncementChannels; label: string; description: string };
  enabled: boolean;
  action: (formData: FormData) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const enabledRef = useRef<HTMLInputElement>(null);

  return (
    <form ref={formRef} action={action} className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-text-primary">{channel.label}</p>
        <p className="text-sm text-text-muted">{channel.description}</p>
      </div>
      <input type="hidden" name="channel" value={channel.key} />
      <input ref={enabledRef} type="hidden" name="enabled" value={String(enabled)} />
      <Toggle
        name={`${channel.key}-toggle`}
        checked={enabled}
        onChange={(next) => {
          if (enabledRef.current) enabledRef.current.value = String(next);
          formRef.current?.requestSubmit();
        }}
      />
    </form>
  );
}
