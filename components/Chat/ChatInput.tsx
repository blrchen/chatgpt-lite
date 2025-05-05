import React, { useState } from 'react';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');

    const handleSendMessage = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..11."
                className="w-full px-4 py-2 pr-16 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="rt-reset rt-BaseButton rt-r-size-3 rt-variant-solid rt-IconButton"
                style={{
                    position: 'absolute',
                    right: '5%',
                    top: '50%',
                    transform: 'translateY(-50%) scale(0.7)',
                    zIndex: 2,
                    background: 'linear-gradient(100deg, rgb(0, 198, 251) 0%, rgb(63, 81, 181) 100%)',
                    borderRadius: '50%',
                    boxShadow: 'rgba(0, 198, 251, 0.533) 0px 0px 16px 4px, rgba(0, 0, 0, 0.12) 0px 2px 8px 0px',
                    transition: 'box-shadow 0.25s, transform 0.18s',
                    padding: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                    animation: 'glowPulse 2s ease infinite alternate'
                }}
            >
                <svg
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            </button>
        </div>
    );
}; 