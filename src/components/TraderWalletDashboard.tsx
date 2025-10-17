import * as React from 'react';
import { useState, useEffect, ReactNode } from 'react';
import { useAccount, useContractRead, useWriteContract, useBalance } from 'wagmi';

import { useTraderSmartWallet } from '../hooks/useTraderSmartWallet';
import { useTraderSmartWalletContract } from '../hooks/useTraderSmartWalletContract';
import { useContractAddresses } from '../hooks/useContractAddresses';
import { ethers } from 'ethers';

// Componente ClientOnly para evitar problemas de SSR
function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : null;
}

  // ABI para ERC20 estándar (para mock USDC en Hyperliquid L1)
  const ERC20Abi = [
    {
      "constant": true,
      "inputs": [{"name": "_owner", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "balance", "type": "uint256"}],
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {"name": "_spender", "type": "address"},
        {"name": "_value", "type": "uint256"}
      ],
      "name": "approve",
      "outputs": [{"name": "", "type": "bool"}],
      "type": "function"
    }
  ];

// Importar ABI completo del contrato upgradeable
import EvaluationSystemAbi from '../../public/abis/EvaluationSystemUpgradeable.json';

export default function TraderWalletDashboard() {
  const { address } = useAccount();
  const { addresses } = useContractAddresses();
  const walletAddress = useTraderSmartWallet();
  const { getTokenBalance } = useTraderSmartWalletContract();
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [txMsg, setTxMsg] = useState<string | null>(null);
  const [faucetSuccess, setFaucetSuccess] = useState(false);
  const [payExamSuccess, setPayExamSuccess] = useState(false);

  // Leer balance HYPE (usando HYPE nativo de HyperEVM)
  const { data: balanceData } = useBalance({
    address: address,
  });
  const usdc = balanceData ? Number(balanceData.value) / 1e18 : 0; // HYPE tiene 18 decimales

  // En HyperEVM testnet, el usuario debe obtener HYPE del faucet
  // Para obtener HYPE, el usuario debe usar el faucet de HyperEVM
  const faucet = null;
  const faucetConfig = null;
  const faucetConfigError = null;
  const faucetWriteError = null;

  // En HyperEVM testnet, usamos HYPE directamente sin aprobación
  const approve = null;
  const approveConfig = null;

  // Pagar examen (startEvaluation) - Usando Wagmi v2
  const { writeContract: payExam, isPending: payLoading, error: payWriteError } = useWriteContract({
    mutation: {
      onSuccess: () => { 
        console.log('Pago exitoso');
        setTxMsg('¡Examen pagado exitosamente! Tu cuenta demo será asignada pronto.'); 
      },
      onError: (e) => { 
        console.error('Error en pago:', e);
        setTxMsg('Error al pagar examen: ' + e.message); 
      },
    },
  });

  // Función para manejar el pago del examen
  const handlePayExam = () => {
    if (!address || !process.env.NEXT_PUBLIC_EVALUATION_SYSTEM_UPGRADEABLE_ADDRESS) {
      setTxMsg('Error: No se puede procesar el pago. Verifica tu conexión.');
      return;
    }

    payExam({
      address: process.env.NEXT_PUBLIC_EVALUATION_SYSTEM_UPGRADEABLE_ADDRESS as `0x${string}`,
      abi: EvaluationSystemAbi.abi,
      functionName: 'startEvaluation',
      args: [1], // tipo de evaluación básico
      value: ethers.parseEther("0.002"), // 0.002 HYPE (precio actualizado)
    });
  };

  // Logs para debugging (solo en desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('PayWriteError:', payWriteError);
      console.log('PayExam function:', payExam);
      console.log('EvaluationSystem address:', process.env.NEXT_PUBLIC_EVALUATION_SYSTEM_UPGRADEABLE_ADDRESS);
      console.log('Address:', address);
      console.log('Contract address valid:', !!process.env.NEXT_PUBLIC_EVALUATION_SYSTEM_UPGRADEABLE_ADDRESS);
    }
  }, [payWriteError, payExam, address]);

  useEffect(() => {
    if (!walletAddress && usdcBalance !== null) setUsdcBalance(null);
    if (walletAddress && getTokenBalance && addresses?.fundXVault) {
      getTokenBalance(addresses.fundXVault).then((bal) => {
        setUsdcBalance(bal ? (Number(bal) / 1e6).toFixed(2) : '0.00');
      });
    }
  }, [walletAddress, getTokenBalance, addresses]);

  useEffect(() => {
    // Solo mostrar mensajes de error si tenemos toda la información necesaria y no estamos cargando
    if (addresses) {
      if (!addresses.evaluationSystem) {
        setTxMsg('Error: No se encontró la dirección del contrato EvaluationSystem.');
      } else {
        setTxMsg(null);
      }
    } else if (!addresses) {
      setTxMsg('Error: No se pudieron cargar las direcciones de los contratos.');
    }
  }, [addresses]);



  return (
    <ClientOnly>
      <div className="bg-white/10 rounded-xl p-6 mt-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Tu Smart Wallet</h2>
        {walletAddress ? (
          <div>
            <span className="font-mono block mb-2">Dirección: {walletAddress}</span>
            <span className="block">Balance HYPE: {usdcBalance ?? 'Cargando...'}</span>
          </div>
        ) : (
          <div>
            <span className="text-yellow-300 block mb-4">No tienes una smart wallet asignada aún.</span>
            <span className="block mb-2">Balance HYPE: {usdc}</span>
            {usdc < 0.001 && (
              <div className="bg-blue-600 text-white px-4 py-2 rounded mb-2">
                <p className="text-sm mb-2">Para obtener HYPE, visita:</p>
                <a 
                  href="https://faucet.hyperevm.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-300 hover:text-yellow-100 underline"
                >
                  HyperEVM Testnet Faucet
                </a>
                <p className="text-xs mt-1">Necesitas HYPE para gas en HyperEVM</p>
              </div>
            )}
            {usdc >= 0.001 && (
              <div className="space-y-2">
                <button 
                  onClick={() => { 
                    // Cambiar a la pestaña de exámenes usando el router
                    const url = new URL(window.location.href);
                    url.searchParams.set('tab', 'exams');
                    window.history.pushState({}, '', url);
                    // Disparar un evento para que el dashboard detecte el cambio
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }} 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded mb-2 transition-colors"
                >
                  Seleccionar Examen
                </button>
                <p className="text-xs text-gray-300">
                  Ve a "Mis Exámenes" para elegir el tipo de examen y proceder al pago
                </p>
              </div>
            )}

            {txMsg && <div className="mt-2 text-sm text-white bg-black/40 rounded p-2">{txMsg}</div>}
            {faucetSuccess && (
              <div className="mt-2 text-sm text-green-300 bg-green-900/60 rounded p-2 border border-green-400">
                ¡USDC recibido exitosamente!
              </div>
            )}
            {payExamSuccess && (
              <div className="mt-2 text-sm text-green-300 bg-green-900/60 rounded p-2 border border-green-400">
                ¡Pago de examen realizado exitosamente! Espera a que se asigne tu cuenta.
              </div>
            )}
          </div>
        )}
      </div>
    </ClientOnly>
  );
} 