"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface RealtimeSubscriptionProps {
  table: string;
  schema?: string;
  onInsert?: (payload: unknown) => void;
  onUpdate?: (payload: unknown) => void;
  onDelete?: (payload: unknown) => void;
  onChange?: () => void;
}

export function useRealtimeSubscription({
  table,
  schema = "public",
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: RealtimeSubscriptionProps) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema,
          table,
        },
        (payload) => {
          if (payload.eventType === "INSERT" && onInsert) onInsert(payload.new);
          if (payload.eventType === "UPDATE" && onUpdate) onUpdate(payload.new);
          if (payload.eventType === "DELETE" && onDelete) onDelete(payload.old);
          if (onChange) onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, schema, onInsert, onUpdate, onDelete, onChange]);
}
