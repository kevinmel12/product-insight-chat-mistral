'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { askQuestion } from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface ChatPanelProps {
  enabled: boolean;
  lockedMessage?: string;
  welcomeMessage?: string;
}

export function ChatPanel({
  enabled,
  lockedMessage = "Run an analysis to unlock the assistant",
  welcomeMessage = "Ask me anything about your fresh UX insights.",
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: lockedMessage },
  ]);
  const [question, setQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (enabled) {
      setMessages([{ role: "assistant", content: welcomeMessage }]);
    } else {
      setMessages([{ role: "assistant", content: lockedMessage }]);
      setQuestion("");
      setError(null);
    }
  }, [enabled, lockedMessage, welcomeMessage]);

  const canSend = useMemo(
    () => enabled && !isSending && question.trim().length > 0,
    [enabled, isSending, question]
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSend) return;

      const trimmed = question.trim();
      setError(null);
      setQuestion("");
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setIsSending(true);

      try {
        const response = await askQuestion(trimmed);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.answer,
          },
        ]);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setIsSending(false);
      }
    },
    [canSend, question]
  );

  return (
    <Card className="flex h-full min-h-[680px] flex-col overflow-hidden border-none bg-card/80 shadow-xl backdrop-blur">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ChatIcon className="h-4 w-4" />
          <span className="text-sm uppercase tracking-wide">AI Assistant</span>
        </div>
        <CardTitle className="text-2xl font-semibold text-foreground">
          Conversation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          The assistant references the latest UX insights to guide your next
          move.
        </p>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-1 flex-col gap-4 p-0">
        <ScrollArea className="flex-1 px-6">
          <div className="relative flex h-full flex-col gap-4 py-6">
            {messages.length === 0 ? (
              <Placeholder enabled={enabled} />
            ) : (
              messages.map((message: Message, index: number) => (
                <MessageBubble key={`${message.role}-${index}`} message={message} />
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
        <Separator />
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 px-6 pb-6 pt-2"
        >
          <div className="flex items-center gap-3">
            <Input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={
                enabled
                  ? "Ask about conversion, UX friction, segments..."
                  : "Run analysis first..."
              }
              disabled={!enabled || isSending}
            />
            <Button
              type="submit"
              disabled={!canSend}
              className="h-11 w-14 rounded-2xl px-0 shadow-lg"
            >
              {isSending ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
              ) : (
                <SendIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

function Placeholder({ enabled }: { enabled: boolean }) {
  return (
    <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
      {enabled
        ? "Ask a question to explore your insights."
        : "Run an analysis to unlock the assistant."}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}
    >
      <div
        className={`max-w-[75%] rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-sm transition ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-background text-muted-foreground ring-1 ring-border"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 18.5 3.5 21v-3.5m0 0A2.5 2.5 0 0 1 1 15V6a2.5 2.5 0 0 1 2.5-2.5h17A2.5 2.5 0 0 1 23 6v9a2.5 2.5 0 0 1-2.5 2.5h-9L6 21v-2.5Z"
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 4.5 20 12 4 19.5 8 12 4 4.5Z"
        className="fill-current"
        stroke="none"
      />
    </svg>
  );
}


