import React from 'react';
import { useNetwork, useAccount } from 'wagmi';

export default function NetworkDetector() {
  const { chain } = useNetwork();
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="bg-yellow-500 text-black px-4 py-2 text-center">
        No se detecta red activa
      </div>
    );
  }

  if (chain?.id !== 998) {
    return (
      <div className="bg-red-500 text-white px-4 py-2 text-center">
        Red incorrecta. Por favor, cambia a HyperEVM Testnet
      </div>
    );
  }

  return (
    <div className="bg-green-500 text-white px-4 py-2 text-center">
      Conectado a HyperEVM Testnet
    </div>
  );
}


