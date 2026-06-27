"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ActionBoard } from "@/components/actions/action-board";
import { ErrorState } from "@/components/ui-state/error-state";
import { LoadingState } from "@/components/ui-state/loading-state";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { ActionBoardShare } from "@/types";

export function SharedActionBoard({ shareToken }: { shareToken: string }) {
  const [share, setShare] = useState<ActionBoardShare | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void api.getActionBoardShareByToken(shareToken).then((result) => {
      if (!cancelled) {
        setShare(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [shareToken]);

  if (share === undefined) {
    return <LoadingState variant="card" label="Loading shared board…" />;
  }

  if (!share) {
    return (
      <ErrorState
        title="Link unavailable"
        description="This shared board link is invalid or has been revoked."
        actions={
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        }
      />
    );
  }

  return <ActionBoard workspaceId={share.workspaceId} readOnly />;
}
