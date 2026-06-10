"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/button";
import { ChamferedPanel } from "@/components/chamfered-panel";
import { EvalBadge } from "@/components/eval-badge";
import { TaxonomyMeta } from "@/components/taxonomy-meta";
import {
  acceptPost,
  getPost,
  regeneratePost,
  rejectPost,
  type PostDetail,
} from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

import { AcceptModal } from "./accept-modal";
import { MarkdownBody } from "./markdown-body";
import { MarkdownSkeleton } from "./markdown-skeleton";
import { RegenerateForm } from "./regenerate-form";

interface ReviewPanelProps {
  postId: string;
  initial?: PostDetail | null;
  onClose: () => void;
  onMutated: () => void;
}

type PendingAction = "accept" | "reject" | "regenerate" | null;

export function ReviewPanel({
  postId,
  initial = null,
  onClose,
  onMutated,
}: ReviewPanelProps) {
  const [detail, setDetail] = useState<PostDetail | null>(
    initial && initial.id === postId ? initial : null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [regenerateFeedback, setRegenerateFeedback] = useState("");
  const [confirmReject, setConfirmReject] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (detail && detail.id === postId) return;
    (async () => {
      try {
        const data = await getPost(postId);
        if (cancelled) return;
        setDetail(data);
        setLoadError(null);
      } catch (e) {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load post");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId, detail]);

  const handleAccept = async (scheduledAtIso: string | undefined) => {
    setPending("accept");
    setActionError(null);
    try {
      await acceptPost(postId, scheduledAtIso);
      onMutated();
      onClose();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Accept failed");
      setPending(null);
    }
  };

  const handleReject = async () => {
    setPending("reject");
    setActionError(null);
    try {
      await rejectPost(postId);
      onMutated();
      onClose();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Reject failed");
      setPending(null);
    }
  };

  const handleRegenerate = async (feedback: string) => {
    setPending("regenerate");
    setActionError(null);
    setRegenerateOpen(false);
    try {
      const updated = await regeneratePost(postId, feedback);
      setDetail(updated);
      setRegenerateFeedback("");
      onMutated();
      setPending(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Regenerate failed");
      setRegenerateOpen(true);
      setPending(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/80 p-3 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Review post"
      data-testid="review-panel"
      onClick={(e) => {
        // Backdrop click (outside the panel) closes; clicks inside the panel
        // bubble up with a different target and are ignored.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <ChamferedPanel
        tier="structural"
        size="shell"
        className="flex max-h-full w-full max-w-[920px] flex-1"
      >
        <div className="flex h-full max-h-full w-full flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-border-dim px-6 pt-6 pb-4 md:px-8">
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
                {"// Review"}
                {detail?.generation_attempt && detail.generation_attempt > 1
                  ? ` · Attempt ${detail.generation_attempt}`
                  : ""}
              </p>
              <h2 className="font-editorial text-[24px] font-bold tracking-[0.02em] text-fg md:text-[28px]">
                {detail?.title ?? "Loading…"}
              </h2>
              {detail && (
                <p className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
                  Generated {formatDateTime(detail.created_at)}
                </p>
              )}
              {detail && <TaxonomyMeta post={detail} className="text-[10px]" />}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close review panel"
              className="flex size-9 shrink-0 items-center justify-center border border-border text-[15px] leading-none text-muted transition-colors hover:border-accent hover:text-fg"
              data-testid="review-close"
            >
              ✕
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
            {loadError ? (
              <p className="font-mono text-xs tracking-[0.2em] text-destructive uppercase">
                {loadError}
              </p>
            ) : !detail ? (
              <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
                Loading…
              </p>
            ) : pending === "regenerate" ? (
              <MarkdownSkeleton />
            ) : (
              <div className="flex flex-col gap-8">
                <section>
                  <MarkdownBody source={detail.content} />
                </section>

                <section className="flex flex-col gap-2" data-testid="review-eval">
                  <h3 className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">
                    Generation Eval
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <EvalBadge post={detail} />
                    {detail.eval_passed !== null && (
                      <span className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                        POV {detail.eval_pov}/2 · Format {detail.eval_format}/2 ·
                        Grounding {detail.eval_grounding}/2
                      </span>
                    )}
                  </div>
                  {detail.eval_notes && (
                    <p className="text-sm leading-relaxed text-muted">
                      {detail.eval_notes}
                    </p>
                  )}
                </section>

                <section className="flex flex-col gap-3">
                  <h3 className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">
                    Sources [{detail.sources.length}]
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {detail.sources.map((src) => (
                      <li key={src.id} className="flex flex-col gap-0.5">
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-accent hover:underline"
                        >
                          {src.title}
                        </a>
                        <span className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                          {src.publisher}
                          {src.published_date ? ` · ${src.published_date}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            )}
          </div>

          <footer className="flex flex-col gap-3 border-t border-border-dim bg-[var(--structural)] px-6 py-5 md:px-8">
            {actionError && (
              <p
                role="alert"
                className="font-mono text-[10px] tracking-[0.25em] text-destructive uppercase"
              >
                {actionError}
              </p>
            )}

            {pending === "regenerate" ? (
              <p
                className="text-center font-mono text-[11px] tracking-[0.25em] text-accent uppercase"
                data-testid="regenerating-status"
              >
                {"// Regenerating…"}
              </p>
            ) : regenerateOpen ? (
              <RegenerateForm
                value={regenerateFeedback}
                onChange={setRegenerateFeedback}
                busy={false}
                onSubmit={handleRegenerate}
                onCancel={() => setRegenerateOpen(false)}
              />
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  disabled={!detail || pending !== null}
                  onClick={() => setAcceptOpen(true)}
                  data-testid="review-accept"
                >
                  Accept
                </Button>

                {confirmReject ? (
                  <>
                    <Button
                      variant="destructive"
                      disabled={pending !== null}
                      onClick={handleReject}
                      data-testid="review-reject-confirm"
                    >
                      Confirm reject
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      disabled={pending !== null}
                      onClick={() => setConfirmReject(false)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="destructive"
                    disabled={!detail || pending !== null}
                    onClick={() => setConfirmReject(true)}
                    data-testid="review-reject"
                  >
                    Reject
                  </Button>
                )}

                <Button
                  variant="ghost"
                  disabled={!detail || pending !== null}
                  onClick={() => setRegenerateOpen(true)}
                  data-testid="review-regenerate"
                >
                  Regenerate
                </Button>
              </div>
            )}
          </footer>
        </div>
      </ChamferedPanel>

      <AcceptModal
        open={acceptOpen}
        busy={pending === "accept"}
        onConfirm={(iso) => {
          setAcceptOpen(false);
          handleAccept(iso);
        }}
        onCancel={() => setAcceptOpen(false)}
      />
    </div>
  );
}
