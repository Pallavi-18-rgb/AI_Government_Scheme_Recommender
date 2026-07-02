import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'ai', text: 'Hello! I am your AI Welfare Assistant. I am connected to your profile and the government scheme database. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const suggestedPrompts = [
        "Which schemes am I eligible for?",
        "Show my top recommendations.",
        "What documents do I need?",
        "Show student scholarships.",
        "Show farmer schemes.",
        "Show women welfare schemes.",
        "Show healthcare schemes.",
        "Show pension schemes."
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/chat/history`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => {
                    if (res.data && res.data.length > 0) {
                        setMessages(res.data);
                    }
                }).catch(err => console.error(err));
        }
    }, []);

    const handleSend = async (e, customMsg = null) => {
        if (e) e.preventDefault();
        const userMsg = customMsg || input.trim();
        if (!userMsg) return;

        const newMsgObj = { sender: 'user', text: userMsg, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, newMsgObj]);
        setInput('');
        setIsTyping(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/chat`, 
                { message: userMsg, history: messages }, 
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply, timestamp: new Date().toISOString() }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { 
                sender: 'ai', 
                text: "⚠️ **System Error**: Unable to reach the AI Engine. Please try again later.",
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Floating Action Button */}
            <button 
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 p-4 bg-cyan-600 text-white rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:bg-cyan-500 hover:scale-110 transition-all z-40 flex items-center justify-center ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
            >
                <Sparkles className="w-6 h-6 absolute opacity-50 animate-ping" />
                <MessageSquare className="w-6 h-6 relative z-10" />
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[400px] glass-panel flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.15)] transition-all origin-bottom-right z-50 overflow-hidden ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ height: '600px', maxHeight: '85vh' }}>
                
                {/* Header */}
                <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md relative z-10">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center mr-3 border border-cyan-500/50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-cyan-500/20 animate-pulse"></div>
                            <Bot className="w-5 h-5 text-cyan-400 relative z-10" />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-md tracking-tight flex items-center">
                                AI Welfare Assistant 
                                <span className="bg-gradient-to-r from-cyan-500 to-purple-500 text-transparent bg-clip-text font-mono text-[10px] ml-2 border border-slate-700 px-1.5 py-0.5 rounded uppercase tracking-widest">v2.0</span>
                            </h3>
                            <p className="text-xs text-slate-400 font-mono flex items-center mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1.5 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span> 
                                Connected to Database
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto bg-slate-950/80 space-y-5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`flex items-end space-x-2 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-slate-700' : 'bg-cyan-900 border border-cyan-800'}`}>
                                    {msg.sender === 'user' ? <User className="w-3 h-3 text-slate-300" /> : <Bot className="w-3 h-3 text-cyan-400" />}
                                </div>
                                <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-cyan-700 text-white rounded-br-sm shadow-lg' : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700 shadow-lg'}`}>
                                    {msg.sender === 'user' ? (
                                        msg.text
                                    ) : (
                                        <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-a:text-cyan-400">
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className={`text-[9px] text-slate-500 mt-1 ${msg.sender === 'user' ? 'pr-8' : 'pl-8'}`}>
                                {formatTime(msg.timestamp)}
                            </span>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start items-end space-x-2">
                            <div className="w-6 h-6 rounded-full bg-cyan-900 border border-cyan-800 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-3 h-3 text-cyan-400" />
                            </div>
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm p-4 flex space-x-1.5 items-center shadow-lg">
                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested Prompts */}
                {messages.length === 1 && (
                    <div className="px-4 pb-2 bg-slate-950/80">
                        <div className="flex flex-wrap gap-2">
                            {suggestedPrompts.map((prompt, i) => (
                                <button 
                                    key={i}
                                    onClick={() => handleSend(null, prompt)}
                                    className="text-[11px] bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full hover:bg-slate-700 hover:border-cyan-500/50 hover:text-cyan-300 transition-all text-left"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-slate-900 border-t border-slate-800 relative z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about schemes, eligibility, or benefits..." 
                            className="w-full bg-slate-950 text-white text-sm rounded-xl pl-4 pr-12 py-3.5 border border-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500"
                            disabled={isTyping}
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 p-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                    <p className="text-center text-[9px] text-slate-500 mt-2 font-mono uppercase tracking-widest">AI can make mistakes. Verify critical eligibility.</p>
                </div>
            </div>
        </>
    );
};

export default Chatbot;
