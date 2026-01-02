import React, { useRef, useEffect, useState } from 'react';
import Message from './Message';
import ChatInput from './ChatInput';
import { sendMessage } from '../services/api';

const ChatArea = ({ activeChat, updateMessages, isSidebarOpen }) => {
    const scrollRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeChat.messages, isLoading]);

    const handleSend = async (content, type = 'text', files = []) => {
        if (!content.trim() && files.length === 0) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            type,
            files: files.map(f => ({
                name: f.name,
                type: f.type,
                url: URL.createObjectURL(f),
                raw: f
            }))
        };

        const newMessages = [...activeChat.messages, userMessage];
        updateMessages(newMessages);
        setIsLoading(true);

        try {
            // Create a temporary message placeholder
            const assistantMessageId = (Date.now() + 1).toString();
            const initialAssistantMessage = {
                id: assistantMessageId,
                role: 'assistant',
                content: '',
                type: 'text'
            };

            // Call API with context
            const response = await sendMessage(content, files, newMessages, type);

            // Update assistant message with final response
            updateMessages([...newMessages, {
                ...initialAssistantMessage,
                content: response.content,
                type: response.type || 'text',
                imageUrl: response.imageUrl,
                error: response.error,
                isQuotaError: response.isQuotaError
            }]);

        } catch (error) {
            console.error("Failed to send message:", error);
            updateMessages([...newMessages, {
                id: Date.now().toString(),
                role: 'assistant',
                content: error.message || 'Sorry, I encountered an error. Please try again.',
                error: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-area fade-in">
            {activeChat.messages.length === 0 ? (
                <div className="welcome-screen">
                    <h1 className="title scale-in">Hello, User Pilot</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.1rem' }}>I'm your Selfie AI Assistant. How can I facilitate your productivity today?</p>
                    <div className="suggestions">
                        <div className="suggestion-card scale-in" onClick={() => handleSend("Design a high-quality logo concept with clear text 'Selfie AI'")}>
                            <p><b>Creative</b><br />Design a professional logo...</p>
                        </div>
                        <div className="suggestion-card scale-in" style={{ animationDelay: '0.1s' }} onClick={() => handleSend("Write a robust Python script for data analysis")}>
                            <p><b>Code</b><br />Write a robust Python script...</p>
                        </div>
                        <div className="suggestion-card scale-in" style={{ animationDelay: '0.2s' }} onClick={() => handleSend("Explain complex architectural patterns in software")}>
                            <p><b>Learn</b><br />Explain architectural patterns...</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="messages-container" ref={scrollRef}>
                    {activeChat.messages.map((msg, index) => (
                        <Message
                            key={msg.id}
                            message={msg}
                            onRetry={(forceImage = false) => {
                                if (forceImage) {
                                    handleSend(msg.content, 'image');
                                } else {
                                    const lastUserMsg = activeChat.messages.slice(0, index).reverse().find(m => m.role === 'user');
                                    if (lastUserMsg) {
                                        handleSend(lastUserMsg.content, lastUserMsg.type, lastUserMsg.files?.map(f => f.raw) || []);
                                    }
                                }
                            }}
                        />
                    ))}
                    {isLoading && (
                        <div className="message assistant loading">
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
    );
};

export default ChatArea;
