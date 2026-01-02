import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Message = ({ message, onRetry }) => {
    const isUser = message.role === 'user';
    const isError = message.error;
    const [countdown, setCountdown] = useState(0);
    const [copiedId, setCopiedId] = useState(null);
    const [imgError, setImgError] = useState(false);
    const [imgLoading, setImgLoading] = useState(true);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleRetry = () => {
        if (message.isQuotaError && countdown === 0) {
            setCountdown(60);
            onRetry();
        } else if (!message.isQuotaError) {
            onRetry();
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className={`message-wrapper ${isUser ? 'user' : 'assistant'} fade-in`}>
            <div className={`message ${isUser ? 'user' : 'assistant'} ${isError ? 'error' : ''}`}>
                <div className="message-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: 0.7, fontSize: '0.8rem', fontWeight: 600 }}>
                    {isUser ? (
                        <>
                            <span style={{ order: 2 }}>You</span>
                            <div className="mini-avatar" style={{ width: '20px', height: '20px', background: '#475569', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', order: 1 }}>U</div>
                        </>
                    ) : (
                        <>
                            <div className="mini-avatar" style={{ width: '20px', height: '20px', background: 'var(--accent-gradient)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white' }}>AI</div>
                            <span>Selfie AI</span>
                        </>
                    )}
                </div>

                {message.files && message.files.length > 0 && (
                    <div className="message-files">
                        {message.files.map((file, i) => (
                            <div key={i} className="file-preview scale-in">
                                {file.type.startsWith('image/') ? (
                                    <img src={file.url} alt={file.name} className="uploaded-img" />
                                ) : (
                                    <div className="file-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                            <polyline points="13 2 13 9 20 9"></polyline>
                                        </svg>
                                        <span>{file.name}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="message-content">
                    {message.imageUrl && !imgError && (
                        <div className={`generated-image-container ${imgLoading ? 'loading' : ''} scale-in`}>
                            <img
                                src={message.imageUrl}
                                alt="Generated"
                                className="generated-image"
                                onLoad={() => setImgLoading(false)}
                                onError={() => {
                                    setImgError(true);
                                    setImgLoading(false);
                                }}
                            />
                            {!imgLoading && (
                                <a href={message.imageUrl} download="generated-image.png" className="download-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                </a>
                            )}
                        </div>
                    )}

                    {imgError && (
                        <div className="image-error-notice slide-in">
                            <p>⚠️ Image generation service is temporarily busy. Please try clicking "Retry" below.</p>
                        </div>
                    )}

                    <div className="text-content">
                        {isUser ? (
                            <p>{message.content}</p>
                        ) : (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const codeString = String(children).replace(/\n$/, '');
                                        const codeId = Math.random().toString(36).substr(2, 9);

                                        return !inline && match ? (
                                            <div className="code-block-container scale-in">
                                                <div className="code-block-header">
                                                    <span>{match[1]}</span>
                                                    <button
                                                        className="copy-code-btn"
                                                        onClick={() => copyToClipboard(codeString, codeId)}
                                                    >
                                                        {copiedId === codeId ? 'Copied!' : 'Copy'}
                                                    </button>
                                                </div>
                                                <SyntaxHighlighter
                                                    style={vscDarkPlus}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{ margin: 0, padding: '20px', background: 'transparent' }}
                                                    {...props}
                                                >
                                                    {codeString}
                                                </SyntaxHighlighter>
                                            </div>
                                        ) : (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        );
                                    }
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        )}
                    </div>

                    {!isUser && !isError && (message.type !== 'image' || imgError) && onRetry && (
                        <button className="visualize-btn" onClick={() => onRetry(true)}>
                            <span>🎨 {imgError ? 'Retry Generation' : 'Visualize this idea'}</span>
                        </button>
                    )}

                    {isError && onRetry && (
                        <button
                            className="retry-btn"
                            onClick={handleRetry}
                            disabled={countdown > 0}
                        >
                            <span>{countdown > 0 ? `Wait ${countdown}s` : 'Try Again Now'}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Message;
