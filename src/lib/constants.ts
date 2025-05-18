import { Address } from 'viem';
import { JACKPOT, MainnetJackpotName } from '@coordinationlabs/megapot-ui-kit';
import { base } from 'viem/chains';

// Get the contract address from the Megapot UI Kit
export const CONTRACT_ADDRESS = JACKPOT[base.id]?.[MainnetJackpotName.USDC]?.address as Address;

// USDC on Base
export const ERC20_TOKEN_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address;
