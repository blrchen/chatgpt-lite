// @ts-nocheck
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Text } from '@radix-ui/themes'
import { FiPlus } from 'react-icons/fi'
import { RiRobot2Line } from 'react-icons/ri'


interface StrategiesSelectorProps {
    strategyList: any[]
    currentStrategyId?: string
    onChangeStrategy: (strategy: any) => void
    onCreateStrategy?: () => void
}

export const StrategiesSelector: React.FC<StrategiesSelectorProps> = ({
    strategyList,
    currentStrategyId,
    onChangeStrategy,
    onCreateStrategy
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
                className="w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-sm font-medium bg-white dark:bg-[#1d1e29] text-black dark:text-white border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="truncate flex items-center gap-2">
                    <RiRobot2Line className="text-sm text-purple-500 dark:text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors" />
                    <span className="text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors font-medium tracking-wide hover:tracking-wider">Strategies</span>
                </span>
                <div className="flex items-center gap-1">
                    <button
                        className="p-1 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-all duration-200 ease-in-out transform hover:scale-110 hover:rotate-90"
                        onClick={(e) => {
                            e.stopPropagation()
                            onCreateStrategy?.()
                        }}
                    >
                        <FiPlus className="text-sm text-purple-500 dark:text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors" />
                    </button>
                    <span className={`text-xs text-purple-500 dark:text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-all duration-200 ease-in-out ${isOpen ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </div>
            </button>

            <div
                className={`absolute z-50 w-full mt-1 bg-white dark:bg-[#1d1e29] rounded-lg shadow-lg border border-purple-200 dark:border-purple-800 transition-all duration-200 ease-in-out transform origin-top ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                    }`}
            >
                <div className="py-1 max-h-60 overflow-y-auto">
                    {strategyList.map((strategy) => (
                        <button
                            key={strategy.id}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-all duration-150 ease-in-out ${strategy.id === currentStrategyId
                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                : 'hover:bg-purple-50/50 dark:hover:bg-purple-900/10 text-gray-700 dark:text-gray-300'
                                }`}
                            onClick={() => {
                                onChangeStrategy(strategy)
                                setIsOpen(false)
                            }}
                        >
                            <RiRobot2Line className={`text-sm ${strategy.id === currentStrategyId ? 'text-purple-500 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`} />
                            <Text className="truncate font-medium tracking-wide hover:tracking-wider">{strategy.title || strategy.name}</Text>
                            {strategy.id === currentStrategyId && (
                                <span className="ml-auto text-purple-500 dark:text-purple-400 text-sm animate-pulse">•</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default StrategiesSelector 