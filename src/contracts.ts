import { createConfig } from 'wagmi'
import { http } from 'viem'
import EvaluationSystemAbi from '../public/abis/EvaluationSystemUpgradeable.json'

// Definir HyperEVM Testnet
export const hyperevmTestnet = {
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

export const wagmiContractConfig = {
  address: process.env.NEXT_PUBLIC_EVALUATION_SYSTEM_UPGRADEABLE_ADDRESS as `0x${string}`,
  abi: EvaluationSystemAbi.abi,
} as const

