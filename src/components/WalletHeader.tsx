import React from 'react';
// import ProfessionalConnectButton from './ProfessionalConnectButton';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface WalletHeaderProps {
  className?: string;
}

export default function WalletHeader({ className = '' }: WalletHeaderProps) {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div className="flex items-center">
        <h2 className="text-2xl font-bold text-white">FundX</h2>
      </div>
      
      <ConnectButton />
    </div>
  );
}
