'use client'
import { useState } from 'react';
import SidePanel from './SidePanel';

export default function SidePanelDemo() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
                Open Panel
            </button>

            <SidePanel isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 text-lg font-medium">Section 1</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            This is some content in the panel.
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 text-lg font-medium">Section 2</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            More content can go here.
                        </p>
                    </div>
                </div>
            </SidePanel>
        </div>
    );
} 