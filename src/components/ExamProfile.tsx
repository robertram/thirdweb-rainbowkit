'use client'
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useReadContract, useWatchContractEvent } from 'wagmi';

import { ethers } from 'ethers';
import { useContractAddresses } from '../hooks/useContractAddresses';
import { wagmiContractConfig } from '../contracts';
import EvaluationSystemAbi from '../../public/abis/EvaluationSystemUpgradeable.json';
import ExamSelection from './ExamSelection';
import PaymentModal from './PaymentModal';
import EvaluationCard from './EvaluationCard';
import TradingDashboard from './TradingDashboard';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Evaluation {
  evaluationId: number;
  trader: string;
  initialBalance: bigint;
  targetProfit: number;
  maxLoss: number;
  startTime: bigint;
  endTime: bigint;
  currentBalance: bigint;
  isActive: boolean;
  isCompleted: boolean;
  isPassed: boolean;
  evaluationType: string | number;
}

interface EvaluationType {
  price: bigint;
  duration: number;
  targetProfit: number;
  maxLoss: number;
  initialBalance: bigint;
  isActive: boolean;
}

interface ExamProfileProps {
  className?: string;
  onExamSelected?: (config: any) => void;
}

export default function ExamProfile({ className = '', onExamSelected }: ExamProfileProps) {
  const { address } = useAccount();
  const { addresses } = useContractAddresses();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evaluationTypes, setEvaluationTypes] = useState<Map<number, EvaluationType>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showExamSelection, setShowExamSelection] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalKey, setModalKey] = useState<string>('');
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [showTradingDashboard, setShowTradingDashboard] = useState(false);

  // Obtener las evaluaciones del usuario
  const { data: traderEvaluations, error: evaluationsError } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'getTraderEvaluations',
    args: [address],
    query: {
      enabled: !!address && !!addresses?.evaluationSystem,
      refetchInterval: 1000, // Watch for changes every second
    },
  });

  // Manejar error de evaluaciones
  useEffect(() => {
    if (evaluationsError) {
      console.log('ℹ️ No hay evaluaciones para este trader o error de contrato:', evaluationsError);
      // No es un error crítico, solo significa que no hay evaluaciones
      setLoading(false);
    }
  }, [evaluationsError]);

  // Función para obtener detalles de una evaluación
  const getEvaluationDetails = async (evaluationId: number) => {
    if (!addresses?.evaluationSystem) return null;

    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_HYPER_EVM_RPC_URL);
      const contract = new ethers.Contract(addresses.evaluationSystem, EvaluationSystemAbi.abi, provider);
      
      // El contrato upgradeable no tiene getEvaluation, usamos evaluations mapping
      const evaluation = await contract.evaluations(evaluationId);
      return evaluation;
    } catch (error) {
      console.error('Error getting evaluation details:', error);
      return null;
    }
  };

  // Función para obtener detalles de un tipo de evaluación
  const getEvaluationTypeDetails = async (typeId: number) => {
    if (!addresses?.evaluationSystem) return null;

    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_HYPER_EVM_RPC_URL);
      const contract = new ethers.Contract(addresses.evaluationSystem, EvaluationSystemAbi.abi, provider);
      
      // Verificar que typeId sea válido
      if (isNaN(typeId) || typeId <= 0) {
        console.warn('Invalid typeId:', typeId);
        return null;
      }
      
      // El contrato upgradeable no tiene getEvaluationType, usamos evaluationTypes mapping
      const evaluationType = await contract.evaluationTypes(typeId);
      return evaluationType;
    } catch (error) {
      console.error('Error getting evaluation type details:', error);
      return null;
    }
  };

  // Estado para almacenar el rendimiento de las evaluaciones
  const [evaluationPerformance, setEvaluationPerformance] = useState<Map<number, number>>(new Map());

  // Función para obtener el rendimiento actual
  const getEvaluationPerformance = async (evaluationId: number) => {
    if (!addresses?.evaluationSystem) return 0;

    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_HYPER_EVM_RPC_URL);
      const contract = new ethers.Contract(addresses.evaluationSystem, EvaluationSystemAbi.abi, provider);
      
      // El contrato upgradeable no tiene getEvaluationPerformance, calculamos manualmente
      const evaluation = await contract.evaluations(evaluationId);
      if (evaluation) {
        const initialBalance = Number(evaluation.initialBalance);
        const currentBalance = Number(evaluation.currentBalance);
        if (initialBalance > 0) {
          return ((currentBalance - initialBalance) / initialBalance) * 100;
        }
      }
      return 0;
    } catch (error) {
      console.error('Error getting evaluation performance:', error);
      return 0;
    }
  };

  // Función para manejar la selección de examen
  const handleExamSelected = (config: any) => {
    console.log('🎯 handleExamSelected called with config:', config);
    
    // Si hay una prop onExamSelected, usarla (modal en dashboard)
    if (onExamSelected) {
      console.log('🎯 Usando onExamSelected del dashboard');
      onExamSelected(config);
      return;
    }
    
    // Si no, usar el modal local (fallback)
    console.log('🎯 Usando modal local');
    setSelectedConfig(config);
    setShowPaymentModal(true);
    setModalKey(`modal-${config.examType}-${Date.now()}`);
    console.log('✅ showPaymentModal set to true, modalKey:', `modal-${config.examType}-${Date.now()}`);
  };

  // Monitorear cambios en showPaymentModal
  useEffect(() => {
    console.log('🔄 showPaymentModal cambió a:', showPaymentModal);
  }, [showPaymentModal]);

  // Función para manejar el pago exitoso
  const handlePaymentSuccess = async (txHash: string) => {
    console.log('✅ Pago confirmado on-chain:', txHash);
    
    // IMPORTANTE: Solo crear API wallet después de confirmar el pago on-chain
    try {
      console.log('🔄 Creando API wallet después de confirmar pago...');
      
      // Notificar al backend para crear API wallet y fondear
      const response = await fetch('http://localhost:3002/api/evaluation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          traderAddress: address,
          phase: 'phase1',
          examType: selectedConfig.examType,
          transactionHash: txHash, // Hash de la transacción confirmada
          confirmed: true // Indicar que el pago fue confirmado
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ API Wallet creada exitosamente:', result.data);
        alert('¡Pago confirmado! API wallet creada y fondeada.');
        // Recargar evaluaciones
        window.location.reload();
      } else {
        console.error('❌ Error creando API wallet:', result.error);
        alert('Pago confirmado pero error creando API wallet. Contacta soporte.');
        // Recargar evaluaciones
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Error notificando al backend:', error);
      alert('Pago confirmado pero error de comunicación. Contacta soporte.');
      // Recargar evaluaciones
      window.location.reload();
    }
  };

  // Función para refrescar evaluaciones
  const handleRefreshEvaluations = () => {
    window.location.reload();
  };

  // Función para ir al trading dashboard
  const handleGoToTrading = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowTradingDashboard(true);
  };

  // Cargar evaluaciones cuando cambien los datos
  useEffect(() => {
    const loadEvaluations = async () => {
      try {
        // Si hay error de evaluaciones, significa que no hay evaluaciones para este trader
        if (evaluationsError) {
          console.log('ℹ️ No hay evaluaciones para este trader');
          setEvaluations([]);
          setEvaluationTypes(new Map());
          setEvaluationPerformance(new Map());
          setLoading(false);
          return;
        }

        if (!traderEvaluations || !Array.isArray(traderEvaluations)) {
          setLoading(false);
          return;
        }

        // Si el array está vacío, no hay evaluaciones
        if (traderEvaluations.length === 0) {
          console.log('ℹ️ Array de evaluaciones vacío');
          setEvaluations([]);
          setEvaluationTypes(new Map());
          setEvaluationPerformance(new Map());
          setLoading(false);
          return;
        }

        setLoading(true);
        const evaluationDetails: Evaluation[] = [];
        const typeDetails = new Map<number, EvaluationType>();
        const performanceDetails = new Map<number, number>();

        for (const evaluationId of traderEvaluations) {
          try {
            const evaluation = await getEvaluationDetails(Number(evaluationId));
            if (evaluation && evaluation.isActive && !evaluation.isCompleted) {
              // Solo mostrar evaluaciones activas y no completadas
              evaluationDetails.push(evaluation);
              
              // Obtener el tipo de evaluación si no lo tenemos
              // El evaluationType puede ser 'demo' (string) o un número
              const typeId = typeof evaluation.evaluationType === 'string' ? 1 : Number(evaluation.evaluationType);
              if (!typeDetails.has(typeId)) {
                try {
                  const evaluationType = await getEvaluationTypeDetails(typeId);
                  if (evaluationType) {
                    typeDetails.set(typeId, evaluationType);
                  }
                } catch (typeError) {
                  console.warn('Error loading evaluation type:', typeError);
                }
              }

              // Obtener el rendimiento
              try {
                const performance = await getEvaluationPerformance(Number(evaluationId));
                performanceDetails.set(Number(evaluationId), performance);
              } catch (perfError) {
                console.warn('Error loading performance:', perfError);
                performanceDetails.set(Number(evaluationId), 0);
              }
            }
          } catch (evalError) {
            console.warn('Error loading evaluation:', evalError);
          }
        }

        setEvaluations(evaluationDetails);
        setEvaluationTypes(typeDetails);
        setEvaluationPerformance(performanceDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error loading evaluations:', error);
        setLoading(false);
        // Mostrar evaluaciones vacías en caso de error
        setEvaluations([]);
        setEvaluationTypes(new Map());
        setEvaluationPerformance(new Map());
      }
    };

    loadEvaluations();
  }, [traderEvaluations, addresses?.evaluationSystem, evaluationsError]);

  // Escuchar eventos de evaluación
  useWatchContractEvent({
    ...wagmiContractConfig,
    eventName: 'EvaluationCreated',
    onLogs: () => {
      // Recargar evaluaciones cuando se cree una nueva
      if (traderEvaluations) {
        // Trigger re-render
        setEvaluations([...evaluations]);
      }
    },
  });

  useWatchContractEvent({
    ...wagmiContractConfig,
    eventName: 'EvaluationCompleted',
    onLogs: () => {
      // Recargar evaluaciones cuando se complete una
      if (traderEvaluations) {
        // Trigger re-render
        setEvaluations([...evaluations]);
      }
    },
  });

  // Función para formatear fecha
  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener el estado del examen
  const getExamStatus = (evaluation: Evaluation) => {
    if (evaluation.isCompleted) {
      return evaluation.isPassed ? 'Aprobado' : 'Reprobado';
    }
    if (evaluation.isActive) {
      return 'Activo';
    }
    return 'Procesando';
  };

  // Función para obtener el color del estado
  const getStatusColor = (evaluation: Evaluation) => {
    if (evaluation.isCompleted) {
      return evaluation.isPassed ? 'text-green-500' : 'text-red-500';
    }
    if (evaluation.isActive) {
      return 'text-blue-500';
    }
    return 'text-yellow-500';
  };

  // Función para obtener el progreso del tiempo
  const getTimeProgress = (evaluation: Evaluation) => {
    if (evaluation.isCompleted) return 100;
    
    const now = Math.floor(Date.now() / 1000);
    const start = Number(evaluation.startTime);
    const end = Number(evaluation.endTime);
    
    if (now <= start) return 0;
    if (now >= end) return 100;
    
    return ((now - start) / (end - start)) * 100;
  };

  if (!address) {
    return (
      <div className={`bg-white/10 rounded-xl p-6 ${className}`}>
        <h2 className="text-2xl font-bold mb-4 text-white">Mis Exámenes</h2>
        <p className="text-gray-300">Conecta tu wallet para ver tus exámenes</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-white/10 rounded-xl p-6 ${className}`}>
        <h2 className="text-2xl font-bold mb-4 text-white">Mis Exámenes</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2 text-white">Cargando exámenes...</span>
        </div>
      </div>
    );
  }

  // Manejo de error de configuración
  if (!addresses?.evaluationSystem) {
    return (
      <div className={`bg-white/10 rounded-xl p-6 ${className}`}>
        <h2 className="text-2xl font-bold mb-4 text-white">Mis Exámenes</h2>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
          <div className="text-red-400 mb-4">
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Error cargando configuraciones</h3>
          </div>
          <p className="text-gray-300 mb-4">
            No se pudieron cargar las configuraciones del sistema. Esto puede deberse a:
          </p>
          <ul className="text-sm text-gray-400 mb-6 space-y-1">
            <li>• Problemas de conexión con la red HyperEVM</li>
            <li>• Contratos no desplegados correctamente</li>
            <li>• Configuración incorrecta del entorno</li>
            <li>• Dirección del contrato: {addresses?.evaluationSystem || 'No disponible'}</li>
          </ul>
          <div className="space-y-2">
            <button
              onClick={handleRefreshEvaluations}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mr-2"
            >
              Reintentar
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar trading dashboard si está seleccionado
  if (showTradingDashboard && selectedEvaluation) {
    return (
      <div className={`bg-white/10 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Trading Dashboard</h2>
          <button
            onClick={() => setShowTradingDashboard(false)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
          >
            Volver a Exámenes
          </button>
        </div>
        {/* <TradingDashboard evaluation={selectedEvaluation} /> */}
      </div>
    );
  }

  // Si se está mostrando la selección de examen
  if (showExamSelection) {
    return (
      <ExamSelection
        onExamSelected={handleExamSelected}
        onBack={() => setShowExamSelection(false)}
      />
    );
  }

  return (
    <div className={`bg-white/10 rounded-xl p-6 ${className}`}>
      <h2 className="text-2xl font-bold mb-6 text-white">Mis Exámenes</h2>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando evaluaciones...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Botón para nuevo examen siempre visible */}
          <div className="text-center py-4">
            <button 
              onClick={() => setShowExamSelection(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              ➕ Nuevo Examen
            </button>
          </div>
          
          {/* Lista de evaluaciones existentes */}
          {evaluations.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                <div className="text-blue-400 mb-4">
                  <svg className="h-12 w-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold">No tienes evaluaciones activas</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Aún no has iniciado ninguna evaluación. ¡Comienza tu primera evaluación ahora!
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Selecciona un tipo de examen y comienza tu viaje como trader profesional.
                </p>
                <button 
                  onClick={() => setShowExamSelection(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  🚀 Comenzar Mi Primera Evaluación
                </button>
              </div>
            </div>
          ) : (
            evaluations.map((evaluation) => {
              const performance = evaluationPerformance.get(Number(evaluation.evaluationId)) || 0;
              const timeProgress = getTimeProgress(evaluation);
              const status = getExamStatus(evaluation);
              const statusColor = getStatusColor(evaluation);
              
              // Obtener el tipo de examen real basado en el balance inicial
              const getExamTypeFromBalance = (balance: bigint) => {
                const balanceInUSDC = Number(balance) / 1e18;
                if (balanceInUSDC === 10) return 'basic';
                if (balanceInUSDC === 20) return 'intermediate';
                if (balanceInUSDC === 30) return 'advanced';
                return 'basic'; // fallback
              };

              // Convertir evaluación al formato esperado por EvaluationCard
              const evaluationForCard = {
                evaluationId: Number(evaluation.evaluationId),
                traderAddress: address || '',
                phase: evaluation.evaluationType === 'demo' ? 'phase1' : 'phase2' as 'phase1' | 'phase2',
                examType: getExamTypeFromBalance(evaluation.initialBalance),
                initialBalance: (Number(evaluation.initialBalance) / 1e18).toString(),
                currentBalance: (Number(evaluation.currentBalance) / 1e18).toString(),
                targetProfit: evaluation.targetProfit,
                maxTotalLoss: evaluation.maxLoss,
                maxDailyLoss: 2,
                maxTimeDays: 30,
                minDaysRequired: 7,
                startTime: Number(evaluation.startTime) * 1000,
                endTime: Number(evaluation.endTime) * 1000,
                isActive: evaluation.isActive,
                isCompleted: evaluation.isCompleted,
                isPassed: evaluation.isPassed,
                hyperliquidAccountId: evaluation.evaluationId.toString()
              };
              
              return (
                <EvaluationCard
                  key={Number(evaluation.evaluationId)}
                  evaluation={evaluationForCard}
                  onRefresh={handleRefreshEvaluations}
                />
              );
            })
          )}
        </div>
      )}

      {/* Modal de Pago */}
      {showPaymentModal && selectedConfig && (
        <>
          {console.log('🎯 RENDERIZANDO PaymentModal:', { showPaymentModal, selectedConfig })}
          <PaymentModal
            key={modalKey}
            isOpen={showPaymentModal}
            onClose={() => {
              console.log('🔒 Cerrando PaymentModal');
              setShowPaymentModal(false);
              setModalKey('');
            }}
            examConfig={selectedConfig}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </>
      )}
      
      {/* Debug info */}
      {console.log('🔍 Estado actual:', { 
        showPaymentModal, 
        selectedConfig: selectedConfig ? 'existe' : 'no existe',
        showExamSelection,
        evaluationsCount: evaluations.length
      })}
    </div>
  );
}
