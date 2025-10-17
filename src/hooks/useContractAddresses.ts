/**
 * Hook para obtener las direcciones de los contratos desde las variables de entorno
 * 
 * Este hook centraliza la obtención de direcciones de contratos para evitar
 * duplicación de código y facilitar el mantenimiento.
 */

import { useMemo } from 'react';

export interface ContractAddresses {
  evaluationSystem: string;
  fundXVault: string;
  rewardDistribution: string;
  traderSmartWalletFactory: string;
}

/**
 * Hook que retorna las direcciones de los contratos desplegados
 * @returns Objeto con las direcciones de los contratos
 */
export function useContractAddresses(): { addresses: ContractAddresses } {
  const addresses = useMemo(() => {
    return {
      evaluationSystem: process.env.NEXT_PUBLIC_EVALUATION_SYSTEM_UPGRADEABLE_ADDRESS || '',
      fundXVault: process.env.NEXT_PUBLIC_FUNDX_VAULT_ADDRESS || '',
      rewardDistribution: process.env.NEXT_PUBLIC_REWARD_DISTRIBUTION_ADDRESS || '',
      traderSmartWalletFactory: process.env.NEXT_PUBLIC_TRADER_SMART_WALLET_FACTORY_ADDRESS || '',
    };
  }, []);

  return { addresses };
}
