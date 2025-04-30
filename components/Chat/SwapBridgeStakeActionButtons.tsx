import React from 'react';
import { FaExchangeAlt } from 'react-icons/fa'; // Swap
import { GiStakesFence } from 'react-icons/gi'; // Stake
import { HiOutlineArrowUp } from 'react-icons/hi'; // Withdraw
import { MdTrendingUp } from 'react-icons/md'; // Trending
import { RiExchangeDollarLine } from 'react-icons/ri'; // Bridge

const actions = [
  {
    key: 'swap',
    label: 'Swap',
    icon: <FaExchangeAlt size={20} className="text-blue-500" />,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    key: 'bridge',
    label: 'Bridge',
    icon: <RiExchangeDollarLine size={20} className="text-purple-500" />,
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  {
    key: 'stake',
    label: 'Stake',
    icon: <GiStakesFence size={20} className="text-green-500" />,
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  {
    key: 'withdraw',
    label: 'Withdraw',
    icon: <HiOutlineArrowUp size={20} className="text-indigo-500" />,
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  {
    key: 'trending',
    label: 'Trending',
    icon: <MdTrendingUp size={20} className="text-pink-500" />,
    bg: 'bg-pink-50',
    border: 'border-pink-200',
  },
];

interface SwapBridgeStakeActionButtonsProps {
  setMessage: (message: string) => void;
  customActions?: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
    message?: string;
    bg?: string;
    border?: string;
  }>;
}

export default function SwapBridgeStakeActionButtons({
  setMessage,
  customActions,
}: SwapBridgeStakeActionButtonsProps) {
  const defaultActions = [
    {
      key: 'swap',
      label: 'Swap',
      icon: <FaExchangeAlt size={20} className="text-blue-500" />,
      message: 'swap 1sol to usdc',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      key: 'bridge',
      label: 'Bridge',
      icon: <RiExchangeDollarLine size={20} className="text-purple-500" />,
      message: 'bridge 1sol to usdc in ethereum',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
    },
    {
      key: 'stake',
      label: 'Stake',
      icon: <GiStakesFence size={20} className="text-green-500" />,
      message: 'stake 1sol in Jupiter',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    {
      key: 'withdraw',
      label: 'Withdraw',
      icon: <HiOutlineArrowUp size={20} className="text-indigo-500" />,
      message: 'withdraw 1jupsol in jupiter',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
    },
  ];

  const actions = customActions || defaultActions;

  const handleAction = (action: { key: string; message?: string }) => {
    if (action.message) {
      setMessage(action.message);
    }
  };

  return (
    <div className="flex flex-row justify-center gap-4 mb-2 mt-1">
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={() => handleAction(action)}
          className={`flex items-center gap-2 px-5 py-2 rounded-full border ${action.bg} ${action.border} shadow-sm hover:shadow-md hover:scale-105 transition-all duration-150 font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${action.key === 'swap' ? 'blue' : action.key === 'bridge' ? 'purple' : action.key === 'stake' ? 'green' : action.key === 'withdraw' ? 'indigo' : 'pink'}-400`}
          style={{ fontSize: 17, letterSpacing: 0.2 }}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
}
