// @ts-nocheck
import React from "react";
import { FaExchangeAlt } from 'react-icons/fa';
import { FaCoins } from 'react-icons/fa';
import { FiZap } from 'react-icons/fi';
import { GiBridge } from 'react-icons/gi';
import { PiBookOpenTextBold } from 'react-icons/pi';
import GradientHero from './GradientHero';
import IconWithLabel from './IconWithLabel';
import SwapBridgeStakeKnowledgeIcons from './SwapBridgeStakeKnowledgeIcons';

export default function WelcomeSection() {
  return (
    <div className="flex flex-col items-center px-4 py-10 pb-0 w-full" style={{}}>
      <div className="flex flex-col items-center w-11/12 md:w-10/12">
        {/* Top: Emoji + Title */}
        <div className="flex items-center gap-3 mb-4">
          <img
            alt="👋"
            loading="lazy"
            width={40}
            height={40}
            src="https://registry.npmmirror.com/@lobehub/fluent-emoji-anim-1/latest/files/assets/1f44b.webp"
            className="shrink-0"
          />
          <GradientHero />
        </div>
        {/* Description */}
        <div className="text-center mb-8" style={{ color: 'var(--text-color-light)' }}>
          <p className="text-xl font-light tracking-wide leading-relaxed" style={{
            color: 'inherit',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            lineHeight: '1.6'
          }}>
            I am your AI-powered DeFi assistant, ready to help you navigate the future of autonomous finance.
          </p>
          <p className="mt-4 text-base font-normal flex items-center justify-center gap-2" style={{
            color: 'inherit',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            letterSpacing: '0.01em',
          }}>
            For specialized DeFi and AI agent operations, click
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>

            to create a new chat.
          </p>
        </div>
      </div>
      <div className="inline-flex justify-center items-start gap-6">
        <div data-property-1="Default" className="w-52 p-4 rounded-xl inline-flex flex-col justify-between items-stretch gap-3 welcome-card flex-1 hover:bg-gray-50/50 transition-colors duration-200 group">
          <div data-property-1="Gym" className="p-2 rounded-lg flex flex-col justify-center items-center overflow-hidden">
            <IconWithLabel icon={<FaExchangeAlt />} label="Swap" color="#3B82F6" />
          </div>
          <div className="text-base welcome-card-title">Swap With the Best route</div>
          <div className="text-xs text-neutral-400 mt-1">Get the best price for your swap.</div>
          <div className="inline-flex justify-start items-center gap-1.5 mt-2 group-hover:text-primary transition-colors duration-200">
            <div className="welcome-card-action underline">Ask this</div>
            <FiZap className="text-gray-400 group-hover:text-primary transition-colors duration-200" style={{ fontSize: '1.35em', strokeWidth: 2, verticalAlign: 'middle' }} />
          </div>
        </div>
        <div data-property-1="Default" className="w-52 p-4 rounded-xl inline-flex flex-col justify-between items-stretch gap-3 welcome-card flex-1 hover:bg-gray-50/50 transition-colors duration-200 group">
          <div data-property-1="Gym" className="p-2 rounded-lg flex flex-col justify-center items-center overflow-hidden">
            <IconWithLabel icon={<GiBridge />} label="Bridge" color="#8B5CF6" />
          </div>
          <div className="self-stretch justify-start">
            <span className="text-base welcome-card-title">Bridge assets to another chain</span>
            <div className="text-xs text-neutral-400 mt-1">Move tokens across blockchains easily.</div>
          </div>
          <div className="inline-flex justify-start items-center gap-1.5 mt-2 group-hover:text-primary transition-colors duration-200">
            <div className="welcome-card-action underline">Ask this</div>
            <FiZap className="text-gray-400 group-hover:text-primary transition-colors duration-200" style={{ fontSize: '1.35em', strokeWidth: 2, verticalAlign: 'middle' }} />
          </div>
        </div>
        <div data-property-1="Default" className="w-52 p-4 rounded-xl inline-flex flex-col justify-between items-stretch gap-3 welcome-card flex-1 hover:bg-gray-50/50 transition-colors duration-200 group">
          <div data-property-1="Gym" className="p-2 rounded-lg flex flex-col justify-center items-center overflow-hidden">
            <IconWithLabel icon={<FaCoins />} label="Stake" color="#22C55E" />
          </div>
          <div className="self-stretch justify-start">
            <span className="text-base welcome-card-title">Stake SOL for 9.11% APY rewards</span>
            <div className="text-xs text-neutral-400 mt-1">Earn passive income by staking SOL.</div>
          </div>
          <div className="inline-flex justify-start items-center gap-1.5 mt-2 group-hover:text-primary transition-colors duration-200">
            <div className="welcome-card-action underline">Ask this</div>
            <FiZap className="text-gray-400 group-hover:text-primary transition-colors duration-200" style={{ fontSize: '1.35em', strokeWidth: 2, verticalAlign: 'middle' }} />
          </div>
        </div>
        <div data-property-1="Default" className="w-52 p-4 rounded-xl inline-flex flex-col justify-between items-stretch gap-3 welcome-card flex-1 hover:bg-gray-50/50 transition-colors duration-200 group">
          <div data-property-1="Gym" className="p-2 rounded-lg flex flex-col justify-center items-center overflow-hidden">
            <IconWithLabel icon={<PiBookOpenTextBold />} label="KnowLedge" color="#F59E42" />
          </div>
          <div className="self-stretch justify-start">
            <span className="text-base welcome-card-title">Get developer docs for protocols</span>
            <div className="text-xs text-neutral-400 mt-1">Find docs for top DeFi projects.</div>
          </div>
          <div className="inline-flex justify-start items-center gap-1.5 mt-2 group-hover:text-primary transition-colors duration-200">
            <div className="welcome-card-action underline">Ask this</div>
            <FiZap className="text-gray-400 group-hover:text-primary transition-colors duration-200" style={{ fontSize: '1.35em', strokeWidth: 2, verticalAlign: 'middle' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
