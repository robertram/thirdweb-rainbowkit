'use client'
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import TraderWalletDashboard from '../../components/TraderWalletDashboard';
import ExamProfile from '../../components/ExamProfile';
import TabNavigation from '../../components/TabNavigation';
import PaymentModal from '../../components/PaymentModal';
import WalletHeader from '../../components/WalletHeader';
// import { useSiweAuth } from '../hooks/useSiweAuth';
import { 
  WalletIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  CogIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { address, isConnected, isConnecting, isDisconnected, status } = useAccount();
  // const { address } = useAccount();
  // const { isAuthenticated } = useSiweAuth();
  const [activeTab, setActiveTab] = useState('wallet');
  
  // Estados para el PaymentModal (persistentes)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [modalKey, setModalKey] = useState<string>('');

  // Leer el parámetro tab de la URL
  // useEffect(() => {
  //   if (router.isReady) {
  //     const tabParam = router.query.tab as string;
  //     if (tabParam && ['wallet', 'exams', 'analytics', 'settings'].includes(tabParam)) {
  //       setActiveTab(tabParam);
  //     }
  //   }
  // }, [router.isReady, router.query.tab]);

  // Escuchar cambios en la URL
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['wallet', 'exams', 'analytics', 'settings'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const tabs = [
    {
      id: 'wallet',
      label: 'Mi Wallet',
      icon: <WalletIcon className="h-4 w-4" />
    },
    {
      id: 'exams',
      label: 'Mis Exámenes',
      icon: <DocumentTextIcon className="h-4 w-4" />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <ChartBarIcon className="h-4 w-4" />
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: <CogIcon className="h-4 w-4" />
    }
  ];

  // Función para manejar la selección de examen
  const handleExamSelected = (config: any) => {
    console.log('🎯 Dashboard: handleExamSelected called with config:', config);
    setSelectedConfig(config);
    setShowPaymentModal(true);
    setModalKey(`modal-${config.examType}-${Date.now()}`);
    console.log('✅ Dashboard: showPaymentModal set to true, modalKey:', `modal-${config.examType}-${Date.now()}`);
  };

  // Función para manejar el pago exitoso
  const handlePaymentSuccess = async (txHash: string) => {
    console.log('✅ Dashboard: Pago confirmado on-chain:', txHash);
    
    // IMPORTANTE: Solo crear API wallet después de confirmar el pago on-chain
    try {
      console.log('🔄 Dashboard: Creando API wallet después de confirmar pago...');
      
      // Obtener la dirección del trader
      const traderAddress = address;
      console.log('🎯 Dashboard: Trader address:', traderAddress);
      
      // Notificar al backend para crear API wallet y fondear
      const response = await fetch('http://localhost:3002/api/evaluation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          traderAddress: traderAddress,
          phase: 'phase1',
          examType: selectedConfig.examType,
          transactionHash: txHash,
          confirmed: true
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Dashboard: API Wallet creada exitosamente:', result.data);
        alert('¡Pago confirmado! API wallet creada y fondeada.');
        // Cerrar modal y limpiar estados
        setShowPaymentModal(false);
        setSelectedConfig(null);
        setModalKey('');
        // Recargar la página para mostrar la nueva evaluación
        window.location.reload();
      } else {
        console.error('❌ Dashboard: Error creando API wallet:', result.error);
        alert('Pago confirmado pero error creando API wallet. Contacta soporte.');
        setShowPaymentModal(false);
        setSelectedConfig(null);
        setModalKey('');
      }
    } catch (error) {
      console.error('❌ Dashboard: Error notificando al backend:', error);
      alert('Pago confirmado pero error de comunicación. Contacta soporte.');
      setShowPaymentModal(false);
      setSelectedConfig(null);
      setModalKey('');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wallet':
        return <TraderWalletDashboard />;
      case 'exams':
        return <ExamProfile onExamSelected={handleExamSelected} />;
      case 'analytics':
        return (
          <div className="bg-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">Analytics</h2>
            <p className="text-gray-300">Próximamente: Estadísticas detalladas de tu rendimiento</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">Configuración</h2>
            <p className="text-gray-300">Próximamente: Configuración de tu cuenta</p>
          </div>
        );
      default:
        return <TraderWalletDashboard />;
    }
  };

  // Protección de autenticación
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <WalletHeader className="mb-6" />
          
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-red-400 mb-4">🔒 Acceso Requiere Autenticación</h2>
              <p className="text-gray-300 mb-6">
                Debes firmar el mensaje SIWE para acceder al dashboard.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Ir al Home para Autenticarte
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header con estado del wallet */}
        <WalletHeader className="mb-6" />
        
        {/* Botón de Home */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <HomeIcon className="h-5 w-5" />
            <span>Ir al Home</span>
          </button>
          <h1 className="text-4xl font-bold text-white">Panel de Trader</h1>
          <div className="w-24"></div> {/* Espaciador para centrar el título */}
        </div>
        
        {/* Navegación por tabs */}
        <TabNavigation 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            // Actualizar la URL sin recargar la página
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tab);
            window.history.pushState({}, '', url);
          }}
          className="mb-8"
        />
        
        {/* Contenido principal */}
        <div className="flex-1 p-6">
          {/* Contenido del tab activo */}
          {activeTab === 'wallet' && (
            <TraderWalletDashboard />
          )}
          {activeTab === 'exams' && (
            <ExamProfile onExamSelected={handleExamSelected} />
          )}
          {activeTab === 'analytics' && (
            <div className="bg-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-white">Analytics</h2>
              <p className="text-gray-300">Análisis de rendimiento y estadísticas</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="bg-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-white">Configuración</h2>
              <p className="text-gray-300">Ajustes de la cuenta y preferencias</p>
            </div>
          )}
        </div>
        
        {/* PaymentModal (persistente) */}
        {showPaymentModal && selectedConfig && (
          <>
            {console.log('🎯 Dashboard: RENDERIZANDO PaymentModal:', { showPaymentModal, selectedConfig })}
            <PaymentModal
              key={modalKey}
              isOpen={showPaymentModal}
              onClose={() => {
                console.log('🔒 Dashboard: Cerrando PaymentModal');
                setShowPaymentModal(false);
                setSelectedConfig(null);
                setModalKey('');
              }}
              examConfig={selectedConfig}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </>
        )}
        
        {/* Debug info */}
        {console.log('🔍 Dashboard: Estado actual:', { 
          showPaymentModal, 
          selectedConfig: selectedConfig ? 'existe' : 'no existe',
          modalKey,
          activeTab
        })}
      </div>
    </div>
  );
} 