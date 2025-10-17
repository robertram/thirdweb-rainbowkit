import { useEffect, useState } from 'react';
import { useAccount, useChainId, useConfig } from 'wagmi';
import TraderSmartWalletFactoryAbi from '../../public/abis/TraderSmartWalletFactory.json';
import { useContractRead } from 'wagmi';
import { useContractAddresses } from './useContractAddresses';
import { ethers, JsonRpcProvider, ZeroAddress } from 'ethers';

export function useTraderSmartWallet() {
  const { address } = useAccount();
  const chainId = useChainId();
  const config = useConfig();
  const { addresses } = useContractAddresses();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !addresses?.traderSmartWalletFactory) return;
    
    // Get the current chain from config
    const chain = config.chains.find(c => c.id === chainId);
    const rpcUrl = chain?.rpcUrls?.default?.http?.[0] || process.env.NEXT_PUBLIC_CHAIN_RPC_URL;
    if (!rpcUrl) return;
    
    try {
      // Para ethers v6, usar JsonRpcProvider directamente
      const provider = new JsonRpcProvider(rpcUrl);
      const factory = new ethers.Contract(addresses.traderSmartWalletFactory, TraderSmartWalletFactoryAbi as any, provider);
      
      factory.getWallet(address).then((w: string) => {
        if (w && w !== ZeroAddress) setWalletAddress(w);
        else setWalletAddress(null);
      }).catch(() => setWalletAddress(null));
    } catch (error) {
      console.error('Error creating provider:', error);
      setWalletAddress(null);
    }
  }, [address, addresses, chainId, config.chains]);

  return walletAddress;
} 