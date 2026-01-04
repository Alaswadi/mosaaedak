import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Sidebar from '../components/Sidebar';
import { conversationService } from '../services/conversationService';
import type { Conversation, Message } from '../services/conversationService';

export default function ConversationHistory() {
    const { isRTL } = useLanguage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (selectedPhone) {
            loadMessages(selectedPhone);
        }
    }, [selectedPhone]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            setLoadingConversations(true);
            const data = await conversationService.getConversations();
            setConversations(data);
            if (data.length > 0 && !selectedPhone) {
                // Optionally select the first one, or leave empty
                // setSelectedPhone(data[0].phoneNumber);
            }
        } catch (error) {
            console.error('Failed to load conversations', error);
        } finally {
            setLoadingConversations(false);
        }
    };

    const loadMessages = async (phoneNumber: string) => {
        try {
            setLoadingMessages(true);
            const data = await conversationService.getMessages(phoneNumber);
            setMessages(data);
        } catch (error) {
            console.error('Failed to load messages', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const filteredConversations = conversations.filter(c =>
        c.phoneNumber.includes(searchTerm)
    );

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };



    return (
        <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            <div className={`flex-1 flex flex-col h-full ${isRTL ? 'lg:mr-70' : 'lg:ml-70'} transition-all duration-300`}>
                {/* Header */}
                <header className="flex-none h-16 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center px-6 justify-between z-10">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 -ml-2 text-neutral-600 dark:text-neutral-400"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                            {isRTL ? 'سجل المحادثات' : 'Conversation History'}
                        </h1>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Users Sidebar */}
                    <div className={`w-80 flex-none bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex flex-col ${selectedPhone ? 'hidden md:flex' : 'flex w-full md:w-80'}`}>
                        {/* Search */}
                        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={isRTL ? 'بحث برقم الهاتف...' : 'Search by phone number...'}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <svg className={`w-5 h-5 text-neutral-400 absolute top-2.5 ${isRTL ? 'right-3' : 'left-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* User List */}
                        <div className="flex-1 overflow-y-auto">
                            {loadingConversations ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="p-8 text-center text-neutral-500 dark:text-neutral-400 text-sm">
                                    {isRTL ? 'لا توجد محادثات' : 'No conversations found'}
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
                                    {filteredConversations.map(conv => (
                                        <button
                                            key={conv.phoneNumber}
                                            onClick={() => setSelectedPhone(conv.phoneNumber)}
                                            className={`w-full p-4 flex items-start gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition text-left rtl:text-right ${selectedPhone === conv.phoneNumber ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center flex-none">
                                                <span className="text-neutral-600 dark:text-neutral-300 font-medium text-sm">
                                                    {conv.phoneNumber.slice(-2)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <span className={`font-medium truncate ${selectedPhone === conv.phoneNumber ? 'text-primary-700 dark:text-primary-400' : 'text-neutral-900 dark:text-white'}`}>
                                                        {conv.phoneNumber}
                                                    </span>
                                                    <span className="text-xs text-neutral-400 flex-none ml-2">
                                                        {formatTime(conv.lastMessageAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                                                    {conv.direction === 'OUTBOUND' && (isRTL ? 'أنت: ' : 'You: ')}
                                                    {conv.lastMessage}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`flex-1 flex flex-col bg-neutral-100 dark:bg-neutral-900 ${!selectedPhone ? 'hidden md:flex' : 'flex'}`}>
                        {selectedPhone ? (
                            <>
                                {/* Chat Header */}
                                <div className="h-16 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center px-6 flex-none">
                                    <button
                                        className="md:hidden mr-4 text-neutral-500"
                                        onClick={() => setSelectedPhone(null)}
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                                        </svg>
                                    </button>
                                    <div>
                                        <h2 className="font-bold text-neutral-900 dark:text-white">{selectedPhone}</h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {isRTL ? 'سجل المحادثة' : 'Chat History'}
                                        </p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {loadingMessages ? (
                                        <div className="flex justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                                            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <p>{isRTL ? 'لا توجد رسائل لعرضها' : 'No messages to display'}</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => {
                                            const isInbound = msg.direction === 'INBOUND';
                                            return (
                                                <div key={msg.id || idx} className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}>
                                                    <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${isInbound
                                                        ? 'bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white rounded-tl-none'
                                                        : 'bg-primary-600 text-white rounded-tr-none'
                                                        }`}>
                                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                                                        <p className={`text-[10px] mt-1 text-right ${isInbound ? 'text-neutral-400' : 'text-primary-200'}`}>
                                                            {formatTime(msg.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50">
                                <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-300 mb-1">
                                    {isRTL ? 'لم يتم تحديد محادثة' : 'No Conversation Selected'}
                                </h3>
                                <p className="text-sm">
                                    {isRTL ? 'اختر مستخدماً من القائمة لعرض المحادثة' : 'Select a user from the list to view conversation history'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
