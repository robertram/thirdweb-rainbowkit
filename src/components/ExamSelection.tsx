import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface ExamType {
  key: string;
  examType: string;
  name: string;
  description: string;
  examPrice: string;
  initialBalance: string;
  currency: string;
  isActive: boolean;
  features: string[];
}

interface Phase {
  key: string;
  phase: string;
  name: string;
  description: string;
  targetProfit: number;
  minDaysRequired: number;
  maxTotalLoss: number;
  maxDailyLoss: number;
  maxTimeDays: number;
  isActive: boolean;
}

interface CombinedConfig {
  phase: string;
  examType: string;
  name: string;
  description: string;
  initialBalance: string;
  currency: string;
  examPrice: string;
  targetProfit: number;
  minDaysRequired: number;
  maxTotalLoss: number;
  maxDailyLoss: number;
  maxTimeDays: number;
  maxPositionSize: number;
  maxLeverage: number;
  maxPositionValue: number;
  maxOpenPositions: number;
  maxDailyTrades: number;
  maxDrawdown: number;
}

interface ExamSelectionProps {
  onExamSelected: (config: CombinedConfig) => void;
  onBack: () => void;
}

export default function ExamSelection({ onExamSelected, onBack }: ExamSelectionProps) {
  const { address } = useAccount();
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [combinedConfig, setCombinedConfig] = useState<CombinedConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Cargar tipos de examen
  useEffect(() => {
    const loadConfigurations = async () => {
      try {
        setLoading(true);
        
        // Cargar tipos de examen
        const examTypesResponse = await fetch('http://localhost:3002/api/config/exam-types');
        const examTypesData = await examTypesResponse.json();
        
        if (examTypesData.success) {
          setExamTypes(examTypesData.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading configurations:', error);
        setError('Error cargando configuraciones');
        setLoading(false);
      }
    };

    loadConfigurations();
  }, []);

  // Cargar configuración combinada cuando se selecciona el tipo de examen
  useEffect(() => {
    const loadCombinedConfig = async () => {
      if (selectedExamType) {
        console.log('Loading combined config for:', selectedExamType);
        try {
          // Siempre usar Fase 1 para la selección inicial
          const response = await fetch(`http://localhost:3002/api/config/combined/phase1/${selectedExamType}`);
          const data = await response.json();
          
          console.log('Combined config response:', data);
          
          if (data.success) {
            setCombinedConfig(data.data);
            console.log('Combined config set successfully');
          } else {
            console.error('Error in response:', data);
            setError('Error cargando configuración combinada');
          }
        } catch (error) {
          console.error('Error loading combined config:', error);
          setError('Error cargando configuración combinada');
        }
      }
    };

    loadCombinedConfig();
  }, [selectedExamType]);

  const handleExamTypeSelect = (examTypeKey: string) => {
    setSelectedExamType(examTypeKey);
    setCombinedConfig(null);
  };



  const handleConfirmSelection = () => {
    console.log('handleConfirmSelection called');
    console.log('combinedConfig:', combinedConfig);
    console.log('selectedExamType:', selectedExamType);
    
    if (combinedConfig) {
      console.log('Calling onExamSelected with:', combinedConfig);
      onExamSelected(combinedConfig);
    } else {
      console.error('No combinedConfig available');
      setError('Error: No se pudo cargar la configuración del examen');
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Cargando configuraciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 rounded-xl p-8 text-center">
        <XCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Selecciona tu Examen</h2>
        <p className="text-gray-300 mb-6">
          Elige el tipo de examen que mejor se adapte a tu experiencia
        </p>
        <button
          onClick={onBack}
          className="text-blue-400 hover:text-blue-300 mb-6"
        >
          ← Volver al Dashboard
        </button>
      </div>

      {/* Selección de Tipo de Examen */}
      <div className="bg-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Tipo de Examen</h3>
        <p className="text-gray-300 mb-6">
          Selecciona el nivel de capital que prefieres para tu evaluación
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {examTypes.map((examType) => (
            <div
              key={examType.key}
              onClick={() => handleExamTypeSelect(examType.key)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedExamType === examType.key
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-gray-600 hover:border-gray-500 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{examType.name}</h4>
                {selectedExamType === examType.key && (
                  <CheckCircleIcon className="h-5 w-5 text-blue-400" />
                )}
              </div>
              
              <p className="text-sm text-gray-300 mb-3">{examType.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CurrencyDollarIcon className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-white">Capital: {examType.initialBalance} {examType.currency}</span>
                </div>
                <div className="flex items-center text-sm">
                  <ChartBarIcon className="h-4 w-4 text-yellow-400 mr-2" />
                  <span className="text-white">Precio: {examType.examPrice} HYPE</span>
                </div>
              </div>
              
              <div className="mt-3">
                <ul className="text-xs text-gray-400 space-y-1">
                  {examType.features.slice(0, 2).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>



      {/* Resumen de Configuración */}
      {combinedConfig && (
        <div className="bg-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">2. Resumen de Configuración</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configuración de Capital */}
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">💰 Configuración de Capital</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Capital inicial:</span>
                  <span className="text-white">{combinedConfig.initialBalance} {combinedConfig.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Precio del examen:</span>
                  <span className="text-white">{combinedConfig.examPrice} HYPE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tamaño max. posición:</span>
                  <span className="text-white">{combinedConfig.maxPositionSize}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Leverage máximo:</span>
                  <span className="text-white">{combinedConfig.maxLeverage}x</span>
                </div>
              </div>
            </div>

            {/* Configuración de Reglas */}
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">📊 Reglas de Evaluación</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Profit objetivo:</span>
                  <span className="text-green-400">{combinedConfig.targetProfit}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Pérdida máxima:</span>
                  <span className="text-red-400">{combinedConfig.maxTotalLoss}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Pérdida diaria:</span>
                  <span className="text-red-400">{combinedConfig.maxDailyLoss}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tiempo máximo:</span>
                  <span className="text-white">{combinedConfig.maxTimeDays} días</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de Confirmación */}
          <div className="mt-6 text-center">
            <button
              onClick={handleConfirmSelection}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Confirmar y Proceder al Pago
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
