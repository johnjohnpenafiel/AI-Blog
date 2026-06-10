"use client";

import { useState } from "react";

import { Button } from "@/components/button";
import { ChamferedPanel } from "@/components/chamfered-panel";
import { EvalBadge } from "@/components/eval-badge";
import { Tag } from "@/components/tag";
import { TaxonomyMeta } from "@/components/taxonomy-meta";
import {
  publishPost,
  reschedulePost,
  unschedulePost,
  type PostListItem,
} from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

import { EditScheduleForm } from "./edit-schedule-form";

interface ScheduledCardProps {
  post: PostListItem;
  onMutated: () => void;
}

type PendingAction = "reschedule" | "publish" | "unschedule" | null;

export function ScheduledCard({ post, onMutated }: ScheduledCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmUnschedule, setConfirmUnschedule] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = pending !== null;

  const run = async (
    action: PendingAction,
    op: () => Promise<unknown>,
  ): Promise<void> => {
    setPending(action);
    setError(null);
    try {
      await op();
      setEditOpen(false);
      setConfirmPublish(false);
      setConfirmUnschedule(false);
      onMutated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setPending(null);
    }
  };

  const handleReschedule = (iso: string) => {
    void run("reschedule", () => reschedulePost(post.id, iso));
  };

  const handlePublish = () => {
    void run("publish", () => publishPost(post.id));
  };

  const handleUnschedule = () => {
    void run("unschedule", () => unschedulePost(post.id));
  };

  return (
    <ChamferedPanel tier="component" size="card" className="w-full">
      <div className="px-5 py-5" data-testid="scheduled-card">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <EvalBadge post={post} />
            <span className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
              {post.scheduled_at
                ? `Scheduled ${formatDateTime(post.scheduled_at)}`
                : "Scheduled"}
            </span>
          </div>
        </div>

        <h3 className="mt-3 font-editorial text-[20px] font-bold tracking-[0.02em] text-fg">
          {post.title}
        </h3>

        <TaxonomyMeta post={post} className="mt-2" />

        <p className="mt-2 font-editorial text-sm leading-relaxed text-muted">
          {post.summary}
        </p>

        {error && (
          <p
            role="alert"
            className="mt-3 font-mono text-[11px] tracking-[0.2em] text-destructive uppercase"
            data-testid="scheduled-card-error"
          >
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => setEditOpen((v) => !v)}
            data-testid="scheduled-edit-toggle"
          >
            Edit schedule
          </Button>

          {confirmPublish ? (
            <>
              <Button
                disabled={busy}
                onClick={handlePublish}
                data-testid="scheduled-publish-confirm"
              >
                Confirm publish
              </Button>
              <Button
                variant="link"
                size="sm"
                disabled={busy}
                onClick={() => setConfirmPublish(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              disabled={busy}
              onClick={() => {
                setConfirmUnschedule(false);
                setConfirmPublish(true);
              }}
              data-testid="scheduled-publish"
            >
              Publish now
            </Button>
          )}

          {confirmUnschedule ? (
            <>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={handleUnschedule}
                data-testid="scheduled-unschedule-confirm"
              >
                Confirm back to queue
              </Button>
              <Button
                variant="link"
                size="sm"
                disabled={busy}
                onClick={() => setConfirmUnschedule(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setConfirmPublish(false);
                setConfirmUnschedule(true);
              }}
              data-testid="scheduled-unschedule"
            >
              Back to queue
            </Button>
          )}
        </div>

        {editOpen && (
          <EditScheduleForm
            initialIso={post.scheduled_at}
            busy={pending === "reschedule"}
            onSave={handleReschedule}
            onCancel={() => setEditOpen(false)}
          />
        )}
      </div>
    </ChamferedPanel>
  );
}
