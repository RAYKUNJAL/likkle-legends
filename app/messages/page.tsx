"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Send, Image, Heart, Smile, PlusCircle,
    MoreVertical, Check, CheckCheck, Clock
} from 'lucide-react';
import { useUser } from '@/components/UserContext';

interface Message {
    id: string;
    sender_id: string;
    sender_name: string;
    sender_avatar?: string;
    content: string;
    type: 'text' | 'image' | 'sticker';
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

const STICKERS = ['🌟', '🎉', '👏', '💪', '🏆', '❤️', '🌴', '🥭', '🎵', '📚', '🦜', '🌺'];

export default function MessagesPage() {
    const { user } = useUser();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [activeContact, setActiveContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [showStickers, setShowStickers] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load contacts
    useEffect(() => {
        async function loadContacts() {
            try {
                // In a real app, this would fetch from an API
                // For now, return empty if no API route handles 'contacts' specifically
                // or mock it if backend isn't ready. 
                // Assuming /api/messages returns list of conversations if no params?
                const res = await fetch('/api/messages?type=concats');
                if (res.ok) {
                    const data = await res.json();
                    setContacts(data.contacts || []);
                    if (data.contacts && data.contacts.length > 0) {
                        setActiveContact(data.contacts[0]);
                    }
                }
            } catch (error) {
                console.error('Failed to load contacts:', error);
            }
        }
        loadContacts();
    }, []);

    // Load messages for active contact
    useEffect(() => {
        if (!activeContact) return;

        async function loadMessages() {
            try {
                const res = await fetch(`/api/messages?contact_id=${activeContact?.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.messages || []);
                }
            } catch (error) {
                console.error('Failed to load messages:', error);
            }
        }
        loadMessages();

        // Poll for new messages every 5s
        const interval = setInterval(loadMessages, 5000);
        return () => clearInterval(interval);
    }, [activeContact]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeContact) return;

        const optimisticMessage: Message = {
            id: Date.now().toString(), // Temp ID
            sender_id: user?.id || 'me',
            sender_name: 'You',
            content: newMessage,
            type: 'text',
            created_at: new Date().toISOString(),
            read: false,
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        setShowStickers(false);

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient_id: activeContact.id,
                    content: optimisticMessage.content,
                    type: 'text'
                })
            });

            if (res.ok) {
                const savedMessage = await res.json();
                // Replace optimistic message with real one
                setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? savedMessage : m));
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const sendSticker = async (sticker: string) => {
        if (!activeContact) return;

        const optimisticMessage: Message = {
            id: Date.now().toString(),
            sender_id: user?.id || 'me',
            sender_name: 'You',
            content: sticker,
            type: 'sticker',
            created_at: new Date().toISOString(),
            read: false,
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setShowStickers(false);

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient_id: activeContact.id,
                    content: sticker,
                    type: 'sticker'
                })
            });

            if (res.ok) {
                const savedMessage = await res.json();
                setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? savedMessage : m));
            }
        } catch (error) {
            console.error('Failed to send sticker:', error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Contacts Sidebar */}
            <aside className="w-80 bg-white border-r border-gray-100 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </Link>
                        <h1 className="text-xl font-black text-gray-900">Messages</h1>
                    </div>

                    <button className="w-full flex items-center gap-3 p-3 bg-primary/5 text-primary rounded-xl font-medium hover:bg-primary/10 transition-colors">
                        <PlusCircle size={20} />
                        Invite Family Member
                    </button>
                </div>

                {/* Contacts List */}
                <div className="flex-1 overflow-y-auto">
                    {contacts.map((contact) => (
                        <button
                            key={contact.id}
                            onClick={() => setActiveContact(contact)}
                            className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${activeContact?.id === contact.id ? 'bg-primary/5 border-l-4 border-primary' : ''
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
                    ))}
                </div>
            </aside>

            {/* Chat Area */}
            {activeContact ? (
                <main className="flex-1 flex flex-col">
                    {/* Chat Header */}
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
                                <p className="text-xs text-gray-500">
                                    {activeContact.online ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-xl" aria-label="Options">
                            <MoreVertical size={20} className="text-gray-400" />
                        </button>
                    </header>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message, index) => {
                            const isMe = message.sender_id === 'me';
                            const showDate = index === 0 ||
                                formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);

                            return (
                                <div key={message.id}>
                                    {showDate && (
                                        <div className="text-center my-4">
                                            <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full">
                                                {formatDate(message.created_at)}
                                            </span>
                                        </div>
                                    )}

                                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                                            <div className={`px-4 py-3 rounded-2xl ${message.type === 'sticker'
                                                ? 'text-4xl bg-transparent'
                                                : isMe
                                                    ? 'bg-primary text-white rounded-br-none'
                                                    : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                                                }`}>
                                                {message.content}
                                            </div>
                                            <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isMe ? 'justify-end' : 'justify-start'
                                                }`}>
                                                <span>{formatTime(message.created_at)}</span>
                                                {isMe && (
                                                    message.read
                                                        ? <CheckCheck size={14} className="text-primary" />
                                                        : <Check size={14} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Sticker Picker */}
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

                    {/* Input */}
                    <div className="bg-white border-t border-gray-100 p-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowStickers(!showStickers)}
                                className={`p-2 rounded-xl transition-colors ${showStickers ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-400'
                                    }`}
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
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                                className="p-3 bg-primary text-white rounded-xl disabled:opacity-50 hover:bg-primary/90 transition-colors"
                                aria-label="Send Message"
                            >
                                <Send size={20} />
                            </button>
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
