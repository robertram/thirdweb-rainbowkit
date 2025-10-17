import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import TradingAccountAbi from '../public/abis/TradingAccount.json';
import { useContractAddresses } from './useContractAddresses';

export function useTradingAccount() {
  const { addresses } = useContractAddresses();
  const contractAddress = addresses?.fundXVault; // Usar fundXVault como proxy

  // Leer número de cuentas fondeadas
  const { data: accountCount } = useContractRead({
    address: contractAddress as `0x${string}` | undefined,
    abi: TradingAccountAbi,
    functionName: 'accountCount',
    watch: true,
  });

  // Ejemplo: crear cuenta fondeada (debe ajustarse según la lógica real)
  const { config } = usePrepareContractWrite({
    address: contractAddress as `0x${string}` | undefined,
    abi: TradingAccountAbi,
    functionName: 'createFundedAccount',
    args: ['0x0000000000000000000000000000000000000000', 1], // ejemplo
  });
  const { write: createFundedAccount } = useContractWrite(config);

  return { accountCount, createFundedAccount };
} 