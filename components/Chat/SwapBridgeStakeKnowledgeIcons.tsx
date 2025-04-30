import React from 'react';
import { FaExchangeAlt } from 'react-icons/fa'; // Swap
import { RiExchangeDollarLine } from 'react-icons/ri'; // Bridge
import { GiStakesFence } from 'react-icons/gi'; // Stake
import { PiBookOpenTextBold } from 'react-icons/pi'; // Knowledge

export default function SwapBridgeStakeKnowledgeIcons() {
  return (
    <div className="flex flex-row items-center gap-2 mr-2">
      <FaExchangeAlt title="Swap" className="text-blue-500" size={20} />
      <RiExchangeDollarLine title="Bridge" className="text-purple-500" size={20} />
      <GiStakesFence title="Stake" className="text-green-500" size={20} />
      <PiBookOpenTextBold title="Knowledge" className="text-yellow-500" size={20} />
    </div>
  );
}
