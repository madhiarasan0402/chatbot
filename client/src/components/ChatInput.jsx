import React, { useState, useRef } from 'react';

const ChatInput = ({ onSend, disabled }) => {
    const [text, setText] = useState('');
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if ((!text.trim() && files.length === 0) || disabled) return;

        // Detect image generation request
        let type = 'text';
        const lowerText = text.toLowerCase();
        const nouns = ['image', 'picture', 'photo', 'illustration', 'art', 'portrait', 'drawing', 'painting', 'sketch', 'wallpaper', 'logo', 'avatar', 'banner', 'concept'];
        const verbs = ['generat', 'creat', 'draw', 'make', 'show', 'paint', 'sketch', 'render', 'design'];

        const hasNoun = nouns.some(n => lowerText.includes(n));
        const hasVerb = verbs.some(v => lowerText.includes(v));

        if (lowerText.startsWith('/image ') || lowerText.startsWith('image of ') || lowerText.startsWith('picture of ') || lowerText.includes('generate a') || lowerText.includes('create a') || (hasNoun && hasVerb)) {
            type = 'image';
        }

        console.log(`[Frontend] Message Type: ${type} | Text: "${text}"`);
        onSend(text, type, files);
        setText('');
        setFiles([]);
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
        e.target.value = '';
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const autoResize = (e) => {
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = (el.scrollHeight) + 'px';
        setText(el.value);
    };

    return (
        <div className="chat-input-container">
            {files.length > 0 && (
                <div className="file-previews scale-in">
                    {files.map((file, i) => (
                        <div key={i} className="input-file-preview">
                            {file.type.startsWith('image/') ? (
                                <img src={URL.createObjectURL(file)} alt="preview" />
                            ) : (
                                <div className="file-thumb">FILE</div>
                            )}
                            <button className="remove-file" onClick={() => removeFile(i)}>×</button>
                        </div>
                    ))}
                </div>
            )}

            <div className="input-wrapper scale-in" style={{ position: 'relative' }}>
                <button
                    type="button"
                    className="icon-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload Assets"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                </button>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    hidden
                    accept="image/*,.pdf,.txt,.docx"
                />

                <textarea
                    placeholder="Message Selfie AI or generate art..."
                    value={text}
                    onChange={autoResize}
                    onKeyDown={handleKeyDown}
                    rows={1}
                />

                <button
                    type="button"
                    className="send-btn"
                    onClick={handleSubmit}
                    disabled={disabled || (!text.trim() && files.length === 0)}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="12" y1="19" x2="12" y2="5"></line>
                        <polyline points="5 12 12 5 19 12"></polyline>
                    </svg>
                </button>
            </div>
            <p className="disclaimer">Selfie AI v2.5 - Intelligence is limited by training data. Check accuracy.</p>
        </div>
    );
};

export default ChatInput;
