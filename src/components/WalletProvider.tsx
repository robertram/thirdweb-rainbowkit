"use client";

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
  baseSepolia,
  hyperliquidEvmTestnet
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

// Definir HyperEVM Testnet
const hyperevmTestnet = {
  id: 998,
  name: 'HyperEVM Testnet',
  network: 'hyperevm-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HYPE',
    symbol: 'HYPE',
  },
  rpcUrls: {
    public: { http: ['https://rpc.hyperliquid-testnet.xyz/evm'] },
    default: { http: ['https://rpc.hyperliquid-testnet.xyz/evm'] },
  },
  blockExplorers: {
    etherscan: { name: 'HyperEVM Explorer', url: 'https://explorer.hyperliquid-testnet.xyz' },
    default: { name: 'HyperEVM Explorer', url: 'https://explorer.hyperliquid-testnet.xyz' },
  },
  testnet: true,
} as const;

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'c12f4e18a46078cde048a598909e641d',
  chains: [hyperevmTestnet],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();
const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
         {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default WalletProvider;