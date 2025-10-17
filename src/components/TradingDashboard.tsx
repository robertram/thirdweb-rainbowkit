import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CogIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';

interface TradingDashboardProps {
  evaluation: {
    evaluationId: number;
    phase: 'phase1' | 'phase2';
    examType: string;
    initialBalance: string;
    currentBalance: string;
    targetProfit: number;
    maxTotalLoss: number;
    maxDailyLoss: number;
    maxTimeDays: number;
    minDaysRequired: number;
    startTime: number;
    endTime: number;
    hyperliquidAccountId: string;
  };
}

export default function TradingDashboard({ evaluation }: TradingDashboardProps) {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [tradingData, setTradingData] = useState({
    openPositions: 0,
    totalPnL: 0,
    dailyPnL: 0,
    totalTrades: 0,
    winRate: 0,
    averageTrade: 0
  });

  // Simular datos de trading (en producción vendrían de la API)
  useEffect(() => {
    const fetchTradingData = async () => {
      setIsLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos simulados
      setTradingData({
        openPositions: Math.floor(Math.random() * 3) + 1,
        totalPnL: parseFloat((Math.random() * 20 - 10).toFixed(2)),
        dailyPnL: parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
        totalTrades: Math.floor(Math.random() * 50) + 10,
        winRate: parseFloat((Math.random() * 40 + 40).toFixed(1)),
        averageTrade: parseFloat((Math.random() * 2 - 1).toFixed(2))
      });
      
      setIsLoading(false);
    };

    fetchTradingData();
    const interval = setInterval(fetchTradingData, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, [evaluation.evaluationId]);

  const getPhaseText = () => {
    return evaluation.phase === 'phase1' ? 'Fase 1' : 'Fase 2';
  };

  const getExamTypeText = () => {
    const types = {
      'basic': 'Básico',
      'intermediate': 'Intermedio',
      'advanced': 'Avanzado'
    };
    return types[evaluation.examType as keyof typeof types] || evaluation.examType;
  };

  const calculateTimeRemaining = () => {
    const now = Date.now();
    const remaining = evaluation.endTime - now;
    if (remaining > 0) {
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return `${days}d ${hours}h`;
    }
    return 'Tiempo agotado';
  };

  const calculateProgress = () => {
    const now = Date.now();
    const totalTime = evaluation.endTime - evaluation.startTime;
    const elapsed = now - evaluation.startTime;
    return Math.min((elapsed / totalTime) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Dashboard de Trading</h2>
            <p className="text-gray-300">
              {getPhaseText()} - {getExamTypeText()} | Cuenta: {evaluation.hyperliquidAccountId}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <CogIcon className="h-5 w-5 text-gray-400" />
            <span className="text-gray-400 text-sm">Configuración</span>
          </div>
        </div>

        {/* Balance y PnL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Balance Actual</span>
              <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              ${parseFloat(evaluation.currentBalance).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">
              Inicial: ${evaluation.initialBalance}
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Total PnL</span>
              {tradingData.totalPnL >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
              )}
            </div>
            <p className={`text-2xl font-bold ${tradingData.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {tradingData.totalPnL >= 0 ? '+' : ''}${tradingData.totalPnL.toFixed(2)}
            </p>
            <p className={`text-xs ${tradingData.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {((tradingData.totalPnL / parseFloat(evaluation.initialBalance)) * 100).toFixed(2)}%
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">PnL Diario</span>
              {tradingData.dailyPnL >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
              )}
            </div>
            <p className={`text-2xl font-bold ${tradingData.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {tradingData.dailyPnL >= 0 ? '+' : ''}${tradingData.dailyPnL.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">Hoy</p>
          </div>
        </div>

        {/* Progreso del tiempo */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Progreso del Tiempo</span>
            <span className="text-gray-400 text-sm">{calculateTimeRemaining()}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Métricas de Trading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Posiciones Abiertas</span>
            <ChartBarIcon className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{tradingData.openPositions}</p>
          <p className="text-xs text-gray-400">Activas</p>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Total Trades</span>
            <ChartPieIcon className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{tradingData.totalTrades}</p>
          <p className="text-xs text-gray-400">Realizados</p>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Win Rate</span>
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">{tradingData.winRate}%</p>
          <p className="text-xs text-gray-400">Trades ganadores</p>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Promedio por Trade</span>
            <CurrencyDollarIcon className="h-4 w-4 text-yellow-400" />
          </div>
          <p className={`text-2xl font-bold ${tradingData.averageTrade >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {tradingData.averageTrade >= 0 ? '+' : ''}${tradingData.averageTrade.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">Por operación</p>
        </div>
      </div>

      {/* Objetivos y Límites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Objetivos</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Profit objetivo:</span>
              <span className="text-green-400 font-bold">{evaluation.targetProfit}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Días mínimos:</span>
              <span className="text-blue-400 font-bold">{evaluation.minDaysRequired} días</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Tiempo máximo:</span>
              <span className="text-yellow-400 font-bold">{evaluation.maxTimeDays} días</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Límites de Riesgo</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Pérdida máxima total:</span>
              <span className="text-red-400 font-bold">-{evaluation.maxTotalLoss}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Pérdida máxima diaria:</span>
              <span className="text-red-400 font-bold">-{evaluation.maxDailyLoss}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Estado:</span>
              <span className="text-green-400 font-bold">Activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Acciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
            Nuevo Trade
          </button>
          <button className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors">
            Ver Posiciones
          </button>
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors">
            Historial
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-center">Actualizando datos...</p>
          </div>
        </div>
      )}
    </div>
  );
}


