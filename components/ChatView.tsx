"use client";
// The open chat: messages and the box to type a new one.
// It checks for new messages every 5 seconds while the page is open.
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markConversationRead, sendMessage } from "@/app/actions/messages";
import { formatClock } from "@/lib/format";
import Icon from "./Icon";
import { showToast } from "./Toast";

type Message = { id: string; body: string; created_at: string; mine: boolean };

export default function ChatView({ conversationId, messages }: { conversationId: string; messages: Message[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const bottom = useRef<HTMLDivElement>(null);

  // Mark as read and keep refreshing while open.
  useEffect(() => {
    markConversationRead(conversationId).then(() => router.refresh());
    const timer = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(timer);
  }, [conversationId, router]);

  // Scroll to the newest message whenever the list changes.
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function send(event: React.FormEvent) {
    event.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    startTransition(async () => {
      const result = await sendMessage(conversationId, body);
      if (result.error) {
        setText(body);
        showToast(result.error);
      }
      router.refresh();
    });
  }

  return (
    <>
      <div className="chat-messages">
        {messages.length === 0 && <p className="suggestion-empty">Gửi lời chào đầu tiên tới người bán nhé.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`message-bubble ${m.mine ? "me" : "them"}`}>
            {m.body}
            <time>{formatClock(m.created_at)}</time>
          </div>
        ))}
        <div ref={bottom} />
      </div>
      <form className="chat-composer" onSubmit={send}>
        <input
          type="text"
          maxLength={500}
          placeholder="Nhập tin nhắn..."
          autoComplete="off"
          aria-label="Tin nhắn"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit" aria-label="Gửi" disabled={pending || !text.trim()}>
          <Icon name="send" />
        </button>
      </form>
    </>
  );
}
