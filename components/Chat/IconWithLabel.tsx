import React from 'react';

export interface IconWithLabelProps {
  icon: React.ReactNode;
  label: string;
  color?: string;
}

const IconWithLabel: React.FC<IconWithLabelProps> = ({ icon, label, color }) => (
  <div className="flex flex-row items-center gap-2">
    <span style={{ color }}>{icon}</span>
    <p className="m-0 p-0 text-base font-normal font-['Anonymous_Pro']">{label}</p>
  </div>
);

export default IconWithLabel;
