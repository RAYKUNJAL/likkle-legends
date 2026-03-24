"use client";

import { FormEvent, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function TattooAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask about pricing, tattoo sizing, the $500 half-sleeve offer, or the 2 for $100 flash special.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }

    const nextMessages = [...messages, { role: "user" as const, content: input }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/tattoo-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const payload = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !payload.reply) {
        throw new Error(payload.error || "Chat failed.");
      }

      setMessages([...nextMessages, { role: "assistant", content: payload.reply }]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "The consult assistant is temporarily unavailable.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="h-[22rem] space-y-3 overflow-y-auto rounded-[1.5rem] border border-white/10 bg-[#120f0e] p-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[90%] rounded-3xl px-4 py-3 text-sm leading-7 ${
              message.role === "assistant"
                ? "bg-white/5 text-stone-200"
                : "ml-auto bg-[#d4a574] text-[#140f0d]"
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Can I use the flash deal for script tattoos?"
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#f5e6c8] px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#140f0d] disabled:opacity-60"
        >
          {loading ? "..." : "Ask"}
        </button>
      </form>
    </div>
  );
}
