import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface Evaluation {
  evaluationId: number;
  traderAddress: string;
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
  isActive: boolean;
  isCompleted: boolean;
  isPassed: boolean;
  hyperliquidAccountId: string;
}

interface EvaluationCardProps {
  evaluation: Evaluation;
  onRefresh: () => void;
}

export default function EvaluationCard({ evaluation, onRefresh }: EvaluationCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [profitLoss, setProfitLoss] = useState<number>(0);
  const [profitLossPercent, setProfitLossPercent] = useState<number>(0);
  const [status, setStatus] = useState<'active' | 'completed' | 'failed' | 'passed'>('active');

  // Calcular métricas en tiempo real
  useEffect(() => {
    const calculateMetrics = () => {
      const now = Date.now();
      const startTime = evaluation.startTime;
      const endTime = evaluation.endTime;
      const initialBalance = parseFloat(evaluation.initialBalance);
      const currentBalance = parseFloat(evaluation.currentBalance);

      // Calcular tiempo restante
      const remaining = endTime - now;
      if (remaining > 0) {
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeRemaining(`${days}d ${hours}h`);
      } else {
        setTimeRemaining('Tiempo agotado');
      }

      // Calcular progreso del tiempo
      const totalTime = endTime - startTime;
      const elapsed = now - startTime;
      const timeProgress = Math.min((elapsed / totalTime) * 100, 100);
      setProgress(timeProgress);

      // Calcular profit/loss
      const pl = currentBalance - initialBalance;
      const plPercent = (pl / initialBalance) * 100;
      setProfitLoss(pl);
      setProfitLossPercent(plPercent);

      // Determinar estado
      if (evaluation.isCompleted) {
        setStatus(evaluation.isPassed ? 'passed' : 'failed');
      } else if (plPercent <= -evaluation.maxTotalLoss) {
        setStatus('failed');
      } else if (plPercent >= evaluation.targetProfit && elapsed >= evaluation.minDaysRequired * 24 * 60 * 60 * 1000) {
        setStatus('passed');
      } else {
        setStatus('active');
      }
    };

    calculateMetrics();
    const interval = setInterval(calculateMetrics, 1000); // Actualizar cada segundo

    return () => clearInterval(interval);
  }, [evaluation]);

  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'text-blue-400';
      case 'passed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'completed': return evaluation.isPassed ? 'text-green-400' : 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'active': return <ClockIcon className="h-5 w-5 text-blue-400" />;
      case 'passed': return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'failed': return <XCircleIcon className="h-5 w-5 text-red-400" />;
      case 'completed': return evaluation.isPassed ? 
        <CheckCircleIcon className="h-5 w-5 text-green-400" /> : 
        <XCircleIcon className="h-5 w-5 text-red-400" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active': return 'En Progreso';
      case 'passed': return 'Aprobado';
      case 'failed': return 'Falló';
      case 'completed': return evaluation.isPassed ? 'Completado - Aprobado' : 'Completado - Falló';
      default: return 'Desconocido';
    }
  };

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

  return (
    <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-white">
              {getPhaseText()} - {getExamTypeText()}
            </h3>
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">ID: {evaluation.evaluationId}</p>
          <p className="text-xs text-gray-400">Cuenta: {evaluation.hyperliquidAccountId}</p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Balance Actual</span>
            <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-white">
            ${parseFloat(evaluation.currentBalance).toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">
            Inicial: ${evaluation.initialBalance}
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Profit/Loss</span>
            {profitLoss >= 0 ? (
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
            )}
          </div>
          <p className={`text-xl font-bold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)}
          </p>
          <p className={`text-xs ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Progreso y objetivos */}
      <div className="space-y-4 mb-6">
        {/* Progreso del tiempo */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Progreso del Tiempo</span>
            <span className="text-gray-400 text-sm">{timeRemaining}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Objetivos */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <ChartBarIcon className="h-4 w-4 text-green-400 mr-2" />
              <span className="text-green-400 text-sm font-medium">Target</span>
            </div>
            <p className="text-lg font-bold text-green-400">{evaluation.targetProfit}%</p>
            <p className="text-xs text-gray-400">Profit objetivo</p>
          </div>

          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-400 mr-2" />
              <span className="text-red-400 text-sm font-medium">Límite</span>
            </div>
            <p className="text-lg font-bold text-red-400">-{evaluation.maxTotalLoss}%</p>
            <p className="text-xs text-gray-400">Pérdida máxima</p>
          </div>
        </div>
      </div>

      {/* Estado actual vs objetivos */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
        <h4 className="text-white font-medium mb-3">Estado Actual</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Profit actual:</span>
            <span className={`font-medium ${profitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Días transcurridos:</span>
            <span className="text-white font-medium">
              {Math.floor((Date.now() - evaluation.startTime) / (1000 * 60 * 60 * 24))} días
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Días mínimos requeridos:</span>
            <span className="text-white font-medium">{evaluation.minDaysRequired} días</span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex space-x-3">
        <button
          onClick={onRefresh}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          Actualizar
        </button>
        {status === 'active' && (
          <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors">
            Ir a Trading
          </button>
        )}
        {status === 'passed' && (
          <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors">
            Siguiente Fase
          </button>
        )}
      </div>
    </div>
  );
}


