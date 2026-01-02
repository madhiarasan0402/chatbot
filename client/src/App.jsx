import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import './App.css';

function App() {
  const [conversations, setConversations] = useState([
    { id: '1', title: 'New Chat', messages: [] }
  ]);
  const [activeId, setActiveId] = useState('1');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeChat = conversations.find(c => c.id === activeId) || conversations[0];

  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: []
    };
    setConversations([newChat, ...conversations]);
    setActiveId(newChat.id);
  };

  const updateMessages = (id, newMessages) => {
    setConversations(prev => prev.map(chat => 
      chat.id === id ? { ...chat, messages: newMessages } : chat
    ));
  };

  const deleteChat = (id) => {
    const filtered = conversations.filter(c => c.id !== id);
    if (filtered.length === 0) {
      handleNewChat();
    } else {
      setConversations(filtered);
      if (activeId === id) setActiveId(filtered[0].id);
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        conversations={conversations} 
        activeId={activeId} 
        setActiveId={setActiveId}
        onNewChat={handleNewChat}
        onDeleteChat={deleteChat}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <ChatArea 
        activeChat={activeChat} 
        updateMessages={(msgs) => updateMessages(activeId, msgs)}
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
}

export default App;
