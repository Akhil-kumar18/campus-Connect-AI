import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Loader2, Trash2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

export function ChatSupport() {
    const { user } = useAuth();
    const token = localStorage.getItem('campusconnect_token');
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Hi! I'm your AI Campus Assistant. Ask me about your exams, timetable, notes, or interview practice!", sender: 'bot' }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleClear = () => {
        setMessages([
            { id: '1', text: "Hi! I'm your AI Campus Assistant. Ask me about your exams, timetable, notes, or interview practice!", sender: 'bot' }
        ]);
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: userMessage.text })
            });

            const data = await response.json();

            if (response.ok) {
                const botMessage: Message = { id: (Date.now() + 1).toString(), text: data.response, sender: 'bot' };
                setMessages(prev => [...prev, botMessage]);
            } else {
                const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "Sorry, I'm having trouble connecting right now.", sender: 'bot' };
                setMessages(prev => [...prev, errorMessage]);
            }

        } catch (error) {
            const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "Network error. Please try again later.", sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-24 z-50 flex flex-col items-end gap-4">
            {isOpen && (
                <Card className="w-96 h-[32rem] shadow-xl flex flex-col animate-in fade-in slide-in-from-bottom-5">
                    <CardHeader className="p-4 border-b bg-primary text-primary-foreground rounded-t-lg flex flex-row justify-between items-center">
                        <CardTitle className="text-sm font-medium">Campus AI Support</CardTitle>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary/90" onClick={handleClear} title="Clear Chat">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary/90" onClick={() => setIsOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col flex-1 overflow-hidden bg-background">
                        <ScrollArea className="flex-1 p-4">
                            <div className="flex flex-col gap-3">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`p-3 rounded-lg max-w-[80%] text-sm whitespace-pre-wrap ${msg.sender === 'user'
                                            ? 'bg-primary text-primary-foreground self-end rounded-tr-none'
                                            : 'bg-muted text-foreground self-start rounded-tl-none'
                                            }`}
                                    >
                                        {msg.text.split(/(\[.*?\]\(.*?\))/g).map((part, index) => {
                                            const match = part.match(/\[(.*?)\]\((.*?)\)/);
                                            if (match) {
                                                return (
                                                    <a
                                                        key={index}
                                                        href={match[2]}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="underline hover:text-primary font-medium"
                                                    >
                                                        {match[1]}
                                                    </a>
                                                );
                                            }
                                            return part;
                                        })}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="bg-muted self-start p-3 rounded-lg rounded-tl-none max-w-[80%]">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>
                        <div className="p-3 border-t flex gap-2">
                            <Input
                                placeholder="Ask about exams, notes..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                className="flex-1"
                                disabled={isLoading}
                            />
                            <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-full h-14 w-14 shadow-lg p-0"
                size="icon"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>
        </div>
    );
}
