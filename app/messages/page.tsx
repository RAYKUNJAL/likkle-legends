"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Image,
  Smile,
  PlusCircle,
  MoreVertical,
  Check,
  CheckCheck,
} from "lucide-react";
import { useUser } from "@/components/UserContext";
import { sanitizeInput } from "@/lib/sanitize";
import { Button } from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  type: "text" | "image" | "sticker";
  image_url?: string;
  created_at: string;
  read: boolean;
}

interface Contact {
  id: string;
  name: string;
  relationship: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  online: boolean;
}

const STICKERS = ["🌟", "🎉", "👏", "💪", "🏆", "❤️", "🌴", "🥭", "🎵", "📚", "🦜", "🌺"];

export default function MessagesPage() {
  const { user } = useUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadContacts = async () => {
      setLoadingContacts(true);
      setContactsError(null);
      try {
        const res = await fetch("/api/messages?type=concats");
        if (!res.ok) throw new Error("Unable to load conversations");
        const data = await res.json();
        setContacts(data.contacts || []);
        if (data.contacts && data.contacts.length > 0) {
          setActiveContact(data.contacts[0]);
        }
      } catch (error) {
        console.error("Failed to load contacts:", error);
        setContactsError("We couldn't load conversations right now. Please try again.");
      } finally {
        setLoadingContacts(false);
      }
    };

    loadContacts();
  }, []);

  useEffect(() => {
    if (!activeContact) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      setMessagesError(null);
      try {
        const res = await fetch(`/api/messages?contact_id=${activeContact.id}`);
        if (!res.ok) throw new Error("Unable to fetch messages");
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Failed to load messages:", error);
        setMessagesError("We couldn't refresh the chat. Please try again.");
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [activeContact]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    const sanitizedMessage = sanitizeInput(newMessage);
    if (!sanitizedMessage || !activeContact) return;

    const optimisticMessage: Message = {
      id: Date.now().toString(),
      sender_id: user?.id || "me",
      sender_name: "You",
      content: sanitizedMessage,
      type: "text",
      created_at: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
    setShowStickers(false);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: activeContact.id,
          content: sanitizedMessage,
          type: "text",
        }),
      });

      if (res.ok) {
        const savedMessage = await res.json();
        setMessages((prev) =>
          prev.map((message) =>
            message.id === optimisticMessage.id ? savedMessage : message
          )
        );
      } else {
        throw new Error("Server rejected the message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((message) => message.id !== optimisticMessage.id));
      setMessagesError("Message could not be delivered. Try again.");
    }
  };

  const sendSticker = async (sticker: string) => {
    if (!activeContact) return;

    const optimisticMessage: Message = {
      id: Date.now().toString(),
      sender_id: user?.id || "me",
      sender_name: "You",
      content: sanitizeInput(sticker),
      type: "sticker",
      created_at: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setShowStickers(false);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: activeContact.id,
          content: optimisticMessage.content,
          type: "sticker",
        }),
      });

      if (res.ok) {
        const savedMessage = await res.json();
        setMessages((prev) =>
          prev.map((message) =>
            message.id === optimisticMessage.id ? savedMessage : message
          )
        );
      } else {
        throw new Error("Sticker could not be saved");
      }
    } catch (error) {
      console.error("Failed to send sticker:", error);
      setMessages((prev) => prev.filter((message) => message.id !== optimisticMessage.id));
      setMessagesError("Sticker delivery failed. Please try again.");
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-80 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <h1 className="text-xl font-black text-gray-900">Messages</h1>
          </div>
          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
            <PlusCircle size={20} />
            Invite Family Member
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingContacts ? (
            <div className="flex items-center justify-center py-10">
              <LoadingSpinner size={36} />
            </div>
          ) : contactsError ? (
            <div className="p-6 text-sm text-red-600">{contactsError}</div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setActiveContact(contact)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${activeContact?.id === contact.id ? "bg-primary/5 border-l-4 border-primary" : ""
                  }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                    {contact.avatar}
                  </div>
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900 truncate">{contact.name}</p>
                    <span className="text-xs text-gray-400">{contact.lastMessageTime}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                </div>
                {contact.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-primary text-white rounded-full text-xs font-bold flex items-center justify-center">
                    {contact.unreadCount}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      {activeContact ? (
        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                  {activeContact.avatar}
                </div>
                {activeContact.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900">{activeContact.name}</p>
                <p className="text-xs text-gray-500">{activeContact.online ? "Online" : "Offline"}</p>
              </div>
            </div>
            <Button variant="ghost" className="text-sm gap-2">
              <MoreVertical size={16} />
              Options
            </Button>
          </header>

          <div className="relative flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {loadingMessages && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                <LoadingSpinner size={40} />
              </div>
            )}
            {messagesError && (
              <div className="text-sm text-red-600 bg-white/80 px-4 py-2 rounded-xl">
                {messagesError}
              </div>
            )}
            {messages.map((message, index) => {
              const isMe = message.sender_id === "me";
              const showDate =
                index === 0 || formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);
              const safeContent = sanitizeInput(message.content);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                  )}

                  <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] ${isMe ? "order-2" : "order-1"}`}>
                      <div
                        className={`px-4 py-3 rounded-2xl ${message.type === "sticker"
                          ? "text-4xl bg-transparent"
                          : isMe
                            ? "bg-primary text-white rounded-br-none"
                            : "bg-white text-gray-900 rounded-bl-none shadow-sm"
                          }`}
                      >
                        {safeContent}
                      </div>
                      <div
                        className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <span>{formatTime(message.created_at)}</span>
                        {isMe &&
                          (message.read ? (
                            <CheckCheck size={14} className="text-primary" />
                          ) : (
                            <Check size={14} />
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {showStickers && (
            <div className="bg-white border-t border-gray-100 p-4">
              <div className="grid grid-cols-6 gap-3">
                {STICKERS.map((sticker) => (
                  <button
                    key={sticker}
                    onClick={() => sendSticker(sticker)}
                    className="text-3xl p-3 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border-t border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowStickers((prev) => !prev)}
                className={`p-2 rounded-xl transition-colors ${showStickers ? "bg-primary text-white" : "hover:bg-gray-100 text-gray-400"}`}
                aria-label="Stickers"
              >
                <Smile size={24} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400" aria-label="Send Image">
                <Image size={24} />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button
                variant="primary"
                onClick={sendMessage}
                disabled={!sanitizeInput(newMessage)}
                className="p-3"
                aria-label="Send Message"
              >
                <Send size={20} />
              </Button>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-400">
            <p>Select a conversation to start messaging</p>
          </div>
        </main>
      )}
    </div>
  );
}
