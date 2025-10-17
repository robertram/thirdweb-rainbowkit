import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'ethers';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import EvaluationSystemAbi from '../../public/abis/EvaluationSystemUpgradeable.json';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  examConfig: {
    name: string;
    examType: string;
    examPrice: string;
    initialBalance: string;
    currency: string;
    targetProfit: number;
    maxTotalLoss: number;
    maxTimeDays: number;
  };
  onPaymentSuccess: (txHash: string) => void;
}

// Función para mapear tipo de examen a ID de evaluación
const getEvaluationTypeId = (examType: string): number => {
  const typeMap: Record<string, number> = {
    'basic': 1,      // Tipo 1: 10 USDC, 0.002 HYPE
    'intermediate': 2, // Tipo 2: 20 USDC, 0.001 HYPE
    'advanced': 3     // Tipo 3: 50 USDC, 0.001 HYPE
  };
  return typeMap[examType] || 1; // Por defecto usar tipo 1 (10 USDC)
};

export default function PaymentModal({ isOpen, onClose, examConfig, onPaymentSuccess }: PaymentModalProps) {
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  // Contrato upgradeable de EvaluationSystem
  const { writeContract, data: paymentData, isPending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: paymentData,
  });

  // Handle success and error using useEffect
  React.useEffect(() => {
    if (isConfirmed && paymentData) {
      setIsProcessing(false);
      onPaymentSuccess(paymentData);
      onClose();
    }
  }, [isConfirmed, paymentData, onPaymentSuccess, onClose]);

  React.useEffect(() => {
    if (writeError) {
      setIsProcessing(false);
      setError('Error confirmando transacción');
    }
  }, [writeError]);

  const handlePayment = async () => {
    if (!address) {
      setError('No hay wallet conectada');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');

      console.log('Procesando pago real:', {
        examType: examConfig.name,
        amount: examConfig.examPrice,
        evaluationTypeId: getEvaluationTypeId(examConfig.examType)
      });

      // Usar writeContract directamente con la configuración
      writeContract({
        address: process.env.NEXT_PUBLIC_EVALUATION_SYSTEM_UPGRADEABLE_ADDRESS as `0x${string}`,
        abi: EvaluationSystemAbi.abi,
        functionName: 'startEvaluation',
        args: [getEvaluationTypeId(examConfig.examType)],
        value: parseEther(examConfig.examPrice),
      });

    } catch (error) {
      console.error('Error procesando pago:', error);
      setError('Error procesando el pago');
      setIsProcessing(false);
    }
  };

  console.log('🔍 PaymentModal render - isOpen:', isOpen, 'examConfig:', examConfig);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Confirmar Pago</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Detalles del examen */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">{examConfig.name}</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Capital inicial:</span>
              <span className="text-white font-medium">{examConfig.initialBalance} {examConfig.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Profit objetivo:</span>
              <span className="text-green-400 font-medium">{examConfig.targetProfit}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Pérdida máxima:</span>
              <span className="text-red-400 font-medium">{examConfig.maxTotalLoss}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Tiempo máximo:</span>
              <span className="text-blue-400 font-medium">{examConfig.maxTimeDays} días</span>
            </div>
          </div>
        </div>

        {/* Monto a pagar */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="text-center">
            <p className="text-gray-300 text-sm mb-1">Monto a pagar</p>
            <p className="text-2xl font-bold text-blue-400">{examConfig.examPrice} HYPE</p>
            <p className="text-xs text-gray-400 mt-1">Token nativo de HyperEVM</p>
          </div>
        </div>

        {/* Wallet conectada */}
        {address && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-green-400 text-sm">Wallet conectada</span>
            </div>
            <p className="text-gray-300 text-xs mt-1 truncate">{address}</p>
          </div>
        )}

        {/* Error */}
        {(error || writeError) && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-400 text-sm">{error || writeError?.message || 'Error desconocido'}</span>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing || isPending || !address}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
          >
            {isProcessing || isPending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </div>
            ) : (
              'Pagar y Comenzar'
            )}
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          <p>Al confirmar el pago, se creará tu evaluación automáticamente</p>
          <p>y recibirás acceso a tu cuenta de trading en Hyperliquid</p>
        </div>
      </div>
    </div>
  );
}
