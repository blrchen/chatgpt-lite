// @ts-nocheck
'use client'
import { useState, useEffect } from 'react';

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function SidePanel({ isOpen, onClose, children }: SidePanelProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Set high z-index for elements that should be below panel
            const elements = document.querySelectorAll('.rt-Flex.rt-r-ai-end.chat-textarea, .w-full.items-end.gap-3.fixed.bottom-0.inset-x-0.z-30');
            elements.forEach(el => {
                (el as HTMLElement).style.zIndex = '-1';
            });

            setIsVisible(true);
            // Start animation after a small delay to allow for initial render
            requestAnimationFrame(() => {
                setIsAnimating(true);
            });
        } else {
            setIsAnimating(false);
            // Reset z-index when closing
            const timer = setTimeout(() => {
                setIsVisible(false);
                const elements = document.querySelectorAll('.rt-Flex.rt-r-ai-end.chat-textarea, .w-full.items-end.gap-3.fixed.bottom-0.inset-x-0.z-30');
                elements.forEach(el => {
                    (el as HTMLElement).style.zIndex = 'initial';
                });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0"
            style={{
                zIndex: 1000,
                // Ensure this is above other elements
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }}
        >
            {/* Backdrop with fade animation */}
            <div
                className={`absolute inset-0 bg-black/50 transition-all duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
            />

            {/* Panel with slide and scale animation */}
            <div
                className={`absolute right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${isAnimating
                    ? 'translate-x-0 scale-100 opacity-100'
                    : 'translate-x-full scale-95 opacity-0'
                    }`}
                style={{
                    transformOrigin: 'right center',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
                    // Ensure panel is above backdrop
                    zIndex: 1001
                }}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div
                        className="flex items-center justify-between border-b p-4"
                        style={{ zIndex: 1002 }}
                    >
                        <h2 className="text-lg font-medium">Panel Title</h2>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                            <span className="block h-4 w-4">
                                <span className="absolute h-0.5 w-4 rotate-45 bg-gray-600 dark:bg-gray-300 transition-transform duration-200"></span>
                                <span className="absolute h-0.5 w-4 -rotate-45 bg-gray-600 dark:bg-gray-300 transition-transform duration-200"></span>
                            </span>
                        </button>
                    </div>

                    {/* Content */}
                    <div
                        className="flex-1 overflow-y-auto p-4"
                        style={{ zIndex: 1001 }}
                    >
                        {children}
                    </div>

                    {/* Footer */}
                    <div
                        className="border-t p-4"
                        style={{ zIndex: 1002 }}
                    >
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>v1.0</span>
                            <div className="flex gap-4">
                                <a href="#" className="hover:underline transition-colors duration-200">Docs</a>
                                <a href="#" className="hover:underline transition-colors duration-200">Support</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 