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
    <Card className="flex h-full w-full flex-col overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <ChatIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">
            AI Assistant
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Ask questions about insights and UX patterns
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="flex min-h-full flex-col gap-3">
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
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder={
                  enabled
                    ? "Ask about conversion, segments..."
                    : "Run analysis first..."
                }
                disabled={!enabled || isSending}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!canSend}
                size="icon"
                className="h-10 w-10 shrink-0"
              >
                {isSending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                ) : (
                  <SendIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : null}
          </form>
        </div>
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
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "border bg-muted/50 text-foreground"
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


