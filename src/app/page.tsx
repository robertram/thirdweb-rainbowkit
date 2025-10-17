/**
 * Página Principal de FundX
 * 
 * Esta es la página de inicio de la plataforma FundX. Muestra información sobre
 * la plataforma, estadísticas, características y permite a los usuarios conectarse
 * con sus wallets para acceder a las funcionalidades.
 * 
 * Funcionalidades:
 * - Landing page con información de la plataforma
 * - Botón de conexión de wallet con SIWE
 * - Detección de red blockchain
 * - Estadísticas en tiempo real (TVL, traders activos, etc.)
 * - Secciones de características y vaults
 */

'use client'

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
// import ProfessionalConnectButton from '../components/ProfessionalConnectButton';

export default function Home() {
  const { address, isConnected } = useAccount();
  // const router = useRouter();

  const [stats, setStats] = useState({
    totalTvl: '$0',
    totalTraders: 0,
    totalProfit: '$0',
    activeVaults: 0
  });

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    // Simular datos de estadísticas
    setStats({
      totalTvl: '$2,450,000',
      totalTraders: 156,
      totalProfit: '$180,000',
      activeVaults: 8
    });
  }, []);

  const features = [
    {
      icon: ChartBarIcon,
      title: 'Evaluaciones Transparentes',
      description: 'Sistema de evaluación descentralizado donde cada trade es verificado en la blockchain.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Cuentas Fondeadas',
      description: 'Accede a capital real sin arriesgar tu dinero. Solo paga la evaluación inicial.'
    },
    {
      icon: UserGroupIcon,
      title: 'Comunidad de Traders',
      description: 'Únete a una comunidad de traders exitosos y comparte estrategias.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Seguridad Garantizada',
      description: 'Smart contracts auditados y transparencia total en todas las operaciones.'
    }
  ];

  const vaults = [
    {
      id: 1,
      name: 'Vault Conservador',
      apr: '8%',
      tvl: '$450,000',
      risk: 'Bajo',
      color: 'bg-green-500'
    },
    {
      id: 2,
      name: 'Vault Balanceado',
      apr: '12%',
      tvl: '$850,000',
      risk: 'Medio',
      color: 'bg-blue-500'
    },
    {
      id: 3,
      name: 'Vault Agresivo',
      apr: '16%',
      tvl: '$1,150,000',
      risk: 'Alto',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Head>
        <title>FundX - Plataforma de Fondeo Descentralizada</title>
        <meta name="description" content="FundX es la primera plataforma de fondeo descentralizada que permite a traders acceder a capital real usando blockchain." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Banner de red */}
      {/* {isMounted && (
        <div className={`w-full ${getBannerClass()} text-black text-center py-2 text-sm font-medium`}>
          {getNetworkStatus()}
        </div>
      )} */}

      {/* Header */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-primary-400" />
              <span className="ml-2 text-2xl font-bold text-white">FundX</span>
            </div>

            <div className="flex items-center space-x-4">
              {/* <ProfessionalConnectButton /> */}

              {/* <ConnectButton /> */}
              <ConnectButton />
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              El Futuro del{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">
                Fondeo
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              La primera plataforma de fondeo descentralizada que permite a traders acceder a capital real
              usando la transparencia y seguridad de la blockchain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
               onClick={() => {
                //router.push('/dashboard')
                console.log('Empezar Evaluación');
              }} className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                Empezar Evaluación
              </Link>
              <button onClick={() => {
                //router.push('/dashboard')
                console.log('Ver Vaults');
              }} className="border border-primary-400 text-primary-400 hover:bg-primary-400 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                Ver Vaults
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.totalTvl}</div>
              <div className="text-gray-300">Total Value Locked</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.totalTraders}</div>
              <div className="text-gray-300">Traders Activos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.totalProfit}</div>
              <div className="text-gray-300">Ganancias Totales</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.activeVaults}</div>
              <div className="text-gray-300">Vaults Activos</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              ¿Por qué elegir FundX?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Combinamos la innovación de DeFi con la tradición del fondeo para crear
              la plataforma más transparente y rentable del mercado.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
                <feature.icon className="h-12 w-12 text-primary-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vaults Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Nuestros Vaults
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Deposita tus stablecoins y gana APR mientras ayudas a financiar traders exitosos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {vaults.map((vault) => (
              <div key={vault.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{vault.name}</h3>
                  <div className={`w-4 h-4 rounded-full ${vault.color}`}></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">APR</span>
                    <span className="text-white font-semibold">{vault.apr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">TVL</span>
                    <span className="text-white font-semibold">{vault.tvl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Riesgo</span>
                    <span className="text-white font-semibold">{vault.risk}</span>
                  </div>
                </div>
                <button className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg transition-colors">
                  Depositar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Únete a la revolución del fondeo descentralizado y comienza tu viaje hacia el éxito financiero.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                // onClick={() => {
                //   // router.push('/dashboard')
                //   console.log('Crear Cuenta');
                // }}
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                Crear Cuenta
              </Link>
              <button onClick={() => {
                //router.push('/trade')
                console.log('Ver Demo');
              }} className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                Ver Demo
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BanknotesIcon className="h-8 w-8 text-primary-400" />
                <span className="ml-2 text-2xl font-bold text-white">FundX</span>
              </div>
              <p className="text-gray-300">
                La plataforma de fondeo descentralizada más transparente y rentable del mercado.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Evaluaciones</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Vaults</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Trading</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Soporte</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Comunidad</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Telegram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 FundX. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 