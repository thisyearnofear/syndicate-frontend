import { Address } from 'viem';
import { JACKPOT, MainnetJackpotName } from '@coordinationlabs/megapot-ui-kit';
import { base } from 'viem/chains';

// Use our specific Megapot contract address instead of the one from the UI Kit
export const CONTRACT_ADDRESS = '0xbEDd4F2beBE9E3E636161E644759f3cbe3d51B95' as Address;

// USDC on Base
export const ERC20_TOKEN_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address;
