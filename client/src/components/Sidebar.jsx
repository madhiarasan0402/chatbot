import React from 'react';

const Sidebar = ({ conversations, activeId, setActiveId, onNewChat, onDeleteChat, isOpen, toggleSidebar }) => {
    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '0 8px' }}>
                    <div className="logo-icon" style={{ width: '32px', height: '32px', background: 'var(--accent-gradient)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>S</div>
                    <span style={{ fontWeight: 700, fontSize: '1.2rem', family: 'Outfit', color: 'white' }}>Selfie AI</span>
                </div>
                <button className="new-chat-btn" onClick={onNewChat}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>New Discussion</span>
                </button>
            </div>

            <div className="conversations-list">
                <div className="section-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', padding: '16px 12px 8px 12px', fontWeight: 600 }}>Recent History</div>
                {conversations.map(chat => (
                    <div
                        key={chat.id}
                        className={`conversation-item ${activeId === chat.id ? 'active' : ''}`}
                        onClick={() => setActiveId(chat.id)}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span className="chat-title">{chat.title || 'New Session'}</span>
                        {conversations.length > 1 && (
                            <button
                                className="delete-btn"
                                onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">U</div>
                    <div className="user-info">
                        <div style={{ fontWeight: 600 }}>User Pilot</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Free Tier Plan</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
