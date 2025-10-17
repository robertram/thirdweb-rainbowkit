import { useMemo } from 'react';
import { useAccount, useChainId, useConfig } from 'wagmi';
import TraderSmartWalletAbi from '../../public/abis/TraderSmartWallet.json';
import { useContractAddresses } from './useContractAddresses';
import { ethers, JsonRpcProvider } from 'ethers';
import { useTraderSmartWallet } from './useTraderSmartWallet';

export function useTraderSmartWalletContract() {
  const { addresses } = useContractAddresses();
  const { address } = useAccount();
  const chainId = useChainId();
  const config = useConfig();
  const walletAddress = useTraderSmartWallet();

  const contract = useMemo(() => {
    if (!walletAddress) return null;
    
    // Get the current chain from config
    const chain = config.chains.find(c => c.id === chainId);
    const rpcUrl = chain?.rpcUrls?.default?.http?.[0] || process.env.NEXT_PUBLIC_CHAIN_RPC_URL;
    if (!rpcUrl) return null;
    
    try {
      const provider = new JsonRpcProvider(rpcUrl);
      return new ethers.Contract(walletAddress, TraderSmartWalletAbi as any, provider);
    } catch (error) {
      console.error('Error creating contract:', error);
      return null;
    }
  }, [walletAddress, chainId, config.chains]);

  // Ejemplo: leer balance de un token
  const getTokenBalance = async (tokenAddress: string) => {
    if (!contract || !walletAddress) return null;
    try {
      const provider = contract.runner;
      if (!provider) return null;
      const token = new ethers.Contract(tokenAddress, ["function balanceOf(address) view returns (uint256)"], provider);
      return await token.balanceOf(walletAddress);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return null;
    }
  };

  // Ejemplo: ejecutar trade (debe ser llamado con signer)
  // const executeTrade = async (exchange, data) => { ... }

  return { contract, getTokenBalance };
} 