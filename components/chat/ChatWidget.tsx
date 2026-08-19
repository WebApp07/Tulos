"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  CheckCircle2,
  Headset,
  Loader2,
  MessageCircle,
  Send,
  WifiOff,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
  createdAt: string;
};

type View = "chat" | "handoff" | "offline" | "submitted";

const MAX_HISTORY = 12;

function generateConversationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function ChatWidget() {
  const t = useTranslations("chat");
  const locale = useLocale();
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [supportAvailable, setSupportAvailable] = useState<boolean | null>(null);
  const [view, setView] = useState<View>("chat");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [hasGreeted, setHasGreeted] = useState(false);

  const [conversationId, setConversationId] = useState<string>(() =>
    generateConversationId(),
  );
  const sentToAgentRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/support/availability")
      .then((res) => res.json())
      .then((data) => setSupportAvailable(Boolean(data.available)))
      .catch(() => setSupportAvailable(false));
  }, []);

  useEffect(() => {
    const handleOffline = () => setIsOnline(false);
    const handleOnline = () => setIsOnline(true);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    if (open && !hasGreeted && messages.length === 0) {
      setHasGreeted(true);
      setMessages([
        {
          role: "assistant",
          content: t("greeting"),
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [open, hasGreeted, messages.length, t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open, view]);

  const runChat = useCallback(
    async (history: ChatMessage[]) => {
      setStreamError(null);
      const assistantIndex = history.length;
      setMessages([
        ...history,
        { role: "assistant", content: "", createdAt: new Date().toISOString() },
      ]);
      setIsStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.slice(-MAX_HISTORY),
            locale,
          }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error || "Request failed");
        }
        if (!res.body) {
          throw new Error("No response stream");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          const snapshot = acc;
          setMessages((prev) => {
            const next = [...prev];
            next[assistantIndex] = { ...next[assistantIndex], content: snapshot };
            return next;
          });
        }
        if (acc.trim().length === 0) {
          throw new Error(t("error"));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        setStreamError(message || t("error"));
        setMessages((prev) =>
          prev[assistantIndex]?.content
            ? prev
            : prev.filter((_, i) => i !== assistantIndex),
        );
      } finally {
        setIsStreaming(false);
        textareaRef.current?.focus();
      }
    },
    [locale, t],
  );

  const handleSend = (text: string) => {
    const content = text.trim();
    if (!content || isStreaming) return;

    const history: ChatMessage[] = [
      ...messages,
      { role: "user", content, createdAt: new Date().toISOString() },
    ];
    setMessages(history);
    setInput("");
    void runChat(history);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const submitConversation = useCallback(
    async (source: "live_chat" | "offline_form", extraMessage?: string) => {
      const transcript: ChatMessage[] =
        messages.length > 0
          ? messages
          : extraMessage
            ? [
                {
                  role: "user",
                  content: extraMessage,
                  createdAt: new Date().toISOString(),
                },
              ]
            : [];

      const subject =
        transcript.find((m) => m.role === "user")?.content.slice(0, 120) || "";

      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          source,
          messages: transcript,
          customerName: form.name || undefined,
          email: form.email || undefined,
          subject,
        }),
      });

      if (!res.ok) {
        throw new Error(t("error"));
      }
      sentToAgentRef.current = true;
    },
    [conversationId, messages, form.name, form.email, t],
  );

  const handleTalkToHuman = async () => {
    if (sentToAgentRef.current) {
      setView("handoff");
      return;
    }
    if (supportAvailable) {
      setIsSubmitting(true);
      try {
        await submitConversation("live_chat");
        setView("handoff");
      } catch {
        setFormError(t("error"));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setView("offline");
    }
  };

  const handleOfflineForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.message.trim()) {
      setFormError(t("needsInfo"));
      return;
    }
    setIsSubmitting(true);
    try {
      await submitConversation("offline_form", form.message);
      setView("submitted");
      setMessages([]);
      setHasGreeted(false);
      sentToAgentRef.current = false;
      setConversationId(generateConversationId());
    } catch {
      setFormError(t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setHasGreeted(false);
    setStreamError(null);
    sentToAgentRef.current = false;
    setConversationId(generateConversationId());
    setView("chat");
  };

  const signedInName =
    userLoaded && isSignedIn ? user?.fullName || user?.firstName || "" : "";
  const signedInEmail =
    userLoaded && isSignedIn ? user?.primaryEmailAddress?.emailAddress || "" : "";

  const lastAssistantStreaming =
    isStreaming && messages[messages.length - 1]?.role === "assistant";

  const status = supportAvailable
    ? t("online")
    : supportAvailable === false
      ? t("offline")
      : t("checking");

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label={t("title")}
          className="fixed z-[60] bottom-4 right-4 left-4 sm:left-auto sm:w-[400px] flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[calc(100dvh-6rem)]"
        >
          <div className="flex items-center justify-between gap-3 bg-black px-4 py-3 text-white">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Headset className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight">
                  {t("title")}
                </p>
                <p className="truncate text-xs text-white/70">{status}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("close")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!isOnline && (
            <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800">
              <WifiOff className="h-3.5 w-3.5 shrink-0" />
              {t("youAreOffline")}
            </div>
          )}

          <div className="flex min-h-0 flex-1 flex-col">
            {view === "chat" && (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-4">
                  {messages.map((msg, i) => (
                    <MessageRow
                      key={`${msg.role}-${msg.createdAt}-${i}`}
                      message={msg}
                      isUser={msg.role === "user"}
                    />
                  ))}
                  {lastAssistantStreaming &&
                    !messages[messages.length - 1]?.content && (
                      <div className="flex items-start gap-2">
                        <TypingIndicator label={t("typing")} />
                      </div>
                    )}
                  {streamError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      <p className="font-medium">{streamError}</p>
                      <button
                        type="button"
                        onClick={() => {
                          const last = messages[messages.length - 1];
                          if (last?.role === "user") void runChat(messages);
                        }}
                        className="mt-1 font-semibold underline underline-offset-2"
                      >
                        {t("retry")}
                      </button>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                <div className="border-t border-neutral-200 bg-white p-3">
                  <form onSubmit={handleSubmitForm} className="flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(input);
                        }
                      }}
                      rows={1}
                      placeholder={t("placeholder")}
                      disabled={isStreaming || !isOnline}
                      className="max-h-[120px] flex-1 resize-none rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={isStreaming || !input.trim() || !isOnline}
                      aria-label={t("send")}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isStreaming ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={handleTalkToHuman}
                    disabled={isStreaming || isSubmitting}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 transition hover:text-black disabled:opacity-50"
                  >
                    <Headset className="h-3.5 w-3.5" />
                    {t("talkToHuman")}
                  </button>
                </div>
              </>
            )}

            {view === "handoff" && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-neutral-50 px-6 py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <p className="text-sm font-semibold text-neutral-900">
                  {t("connectedTitle")}
                </p>
                <p className="text-sm text-neutral-600">{t("connectedNote")}</p>
                <button
                  type="button"
                  onClick={() => setView("chat")}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 transition hover:text-black"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t("backToChat")}
                </button>
              </div>
            )}

            {view === "offline" && (
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-neutral-50">
                <div className="px-4 pt-4">
                  <p className="text-sm font-semibold text-neutral-900">
                    {t("offlineFormTitle")}
                  </p>
                  <p className="mt-1 text-xs text-neutral-600">
                    {t("offlineFormNote")}
                  </p>
                </div>
                <form
                  onSubmit={handleOfflineForm}
                  className="flex-1 space-y-3 px-4 py-4"
                >
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-neutral-700">
                      {t("name")}
                    </span>
                    <input
                      type="text"
                      value={form.name || signedInName}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t("namePlaceholder")}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-neutral-700">
                      {t("email")}
                    </span>
                    <input
                      type="email"
                      value={form.email || signedInEmail}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder={t("emailPlaceholder")}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-neutral-700">
                      {t("message")}
                    </span>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder={t("messagePlaceholder")}
                      rows={4}
                      className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </label>
                  {formError && (
                    <p className="text-xs font-medium text-red-600">{formError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? t("submitting") : t("submit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("chat")}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 transition hover:text-black"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {t("backToChat")}
                  </button>
                </form>
              </div>
            )}

            {view === "submitted" && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-neutral-50 px-6 py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <p className="text-sm font-semibold text-neutral-900">
                  {t("submittedTitle")}
                </p>
                <p className="text-sm text-neutral-600">{t("submittedNote")}</p>
                <button
                  type="button"
                  onClick={resetConversation}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 transition hover:text-black"
                >
                  {t("startNew")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("close") : t("open")}
        className="fixed bottom-4 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg shadow-black/25 transition hover:scale-105 hover:bg-neutral-900"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}

function MessageRow({ message, isUser }: { message: ChatMessage; isUser: boolean }) {
  const time = new Date(message.createdAt);
  const timeLabel = Number.isNaN(time.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(time);

  return (
    <div
      className={cn(
        "flex max-w-[85%] flex-col gap-1",
        isUser ? "ml-auto items-end" : "mr-auto items-start",
      )}
    >
      <div
        className={cn(
          "whitespace-pre-wrap break-words px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-2xl rounded-tr-sm bg-black text-white"
            : "rounded-2xl rounded-tl-sm border border-neutral-200 bg-white text-neutral-900",
        )}
      >
        {message.content || "\u00A0"}
      </div>
      {timeLabel && (
        <span className="text-[10px] text-neutral-400">{timeLabel}</span>
      )}
    </div>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex max-w-[85%] flex-col gap-1">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-neutral-200 bg-white px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}