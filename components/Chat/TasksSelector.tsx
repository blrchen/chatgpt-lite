// @ts-nocheck
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Text } from '@radix-ui/themes'
import { FiCheckSquare, FiPlus } from 'react-icons/fi'

interface TasksSelectorProps {
    taskList: any[]
    currentTaskId?: string
    onChangeTask: (task: any) => void
    onCreateTask?: () => void
}

export const TasksSelector: React.FC<TasksSelectorProps> = ({
    taskList,
    currentTaskId,
    onChangeTask,
    onCreateTask
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                className="w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-sm font-medium bg-white dark:bg-[#1d1e29] text-black dark:text-white border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="truncate flex items-center gap-2">
                    <FiCheckSquare className="text-sm text-green-500 dark:text-green-400 group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors" />
                    <span className="text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors font-medium tracking-wide hover:tracking-wider">Tasks</span>
                </span>
                <div className="flex items-center gap-1">
                    <button
                        className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-all duration-200 ease-in-out transform hover:scale-110 hover:rotate-90"
                        onClick={(e) => {
                            e.stopPropagation()
                            onCreateTask?.()
                        }}
                    >
                        <FiPlus className="text-sm text-green-500 dark:text-green-400 group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors" />
                    </button>
                    <span className={`text-xs text-green-500 dark:text-green-400 group-hover:text-green-600 dark:group-hover:text-green-300 transition-all duration-200 ease-in-out ${isOpen ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </div>
            </button>

            <div
                className={`absolute z-50 w-full mt-1 bg-white dark:bg-[#1d1e29] rounded-lg shadow-lg border border-green-200 dark:border-green-800 transition-all duration-200 ease-in-out transform origin-top ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                    }`}
            >
                <div className="py-1 max-h-60 overflow-y-auto">
                    {taskList.map((task) => (
                        <button
                            key={task.id}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-all duration-150 ease-in-out ${task.id === currentTaskId
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                : 'hover:bg-green-50/50 dark:hover:bg-green-900/10 text-gray-700 dark:text-gray-300'
                                }`}
                            onClick={() => {
                                onChangeTask(task)
                                setIsOpen(false)
                            }}
                        >
                            <FiCheckSquare className={`text-sm ${task.id === currentTaskId ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
                            <Text className="truncate font-medium tracking-wide hover:tracking-wider">{task.title || task.name}</Text>
                            {task.id === currentTaskId && (
                                <span className="ml-auto text-green-500 dark:text-green-400 text-sm animate-pulse">•</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default TasksSelector 