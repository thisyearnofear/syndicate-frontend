import { ChainId } from "./config";

// Define types for contract addresses by chain
interface LensChainContracts {
  SYNDICATE_REGISTRY: string;
  SYNDICATE_FACTORY: string;
  SYNDICATE_INTENT_RESOLVER: string;
  ACROSS_SPOKE_POOL: string;
}

interface BaseChainContracts {
  TICKET_REGISTRY: string;
  CROSS_CHAIN_RESOLVER: string;
  MEGAPOT_LOTTERY: string;
  BASE_CHAIN_INTENT_RESOLVER: string;
}

type ContractAddressesMap = {
  [ChainId.LENS]: LensChainContracts;
  [ChainId.BASE]: BaseChainContracts;
};

// Deployed contract addresses
export const CONTRACT_ADDRESSES: ContractAddressesMap = {
  // Lens Chain (ChainId 232)
  [ChainId.LENS]: {
    // Registry that stores all Syndicate metadata
    SYNDICATE_REGISTRY: "0x399f080bB2868371D7a0024a28c92fc63C05536E",
    // Factory contract that creates new Syndicates
    SYNDICATE_FACTORY: "0x4996089d644d023F02Bf891E98a00b143201f133",
    // Intent resolver on Lens Chain
    SYNDICATE_INTENT_RESOLVER: "0x21F6514fdabaD6aB9cB227ddE69A1c34C9cF9014",
    // Across SpokePool on Lens Chain
    ACROSS_SPOKE_POOL: "0xe7cb3e167e7475dE1331Cf6E0CEb187654619E12",
  },

  // Base Chain (ChainId 8453)
  [ChainId.BASE]: {
    // Registry that maps lottery tickets to Syndicate addresses
    TICKET_REGISTRY: "0x86e2d8A3eAcfa89295a75116e9489f07CFBd198B",
    // Monitors and resolves when a Syndicate's ticket wins
    CROSS_CHAIN_RESOLVER: "0x07B73B99fbB0F82f981A5954A7f3Fd72Ce391c2F",
    // Megapot Lottery Contract
    MEGAPOT_LOTTERY: "0xbEDd4F2beBE9E3E636161E644759f3cbe3d51B95",
    // Intent resolver on Base Chain
    BASE_CHAIN_INTENT_RESOLVER: "0xecF8095577EA91cFd1aBe6f59Aaad597622a9Fd3",
  },
};

// Helper function to get contract address
export function getContractAddress(
  chainId: ChainId,
  contractKey: string
): string {
  if (chainId === ChainId.LENS) {
    return CONTRACT_ADDRESSES[ChainId.LENS][
      contractKey as keyof LensChainContracts
    ];
  } else if (chainId === ChainId.BASE) {
    return CONTRACT_ADDRESSES[ChainId.BASE][
      contractKey as keyof BaseChainContracts
    ];
  }
  throw new Error(`No contract addresses configured for chain ID ${chainId}`);
}

// Syndicate type definition
export interface SyndicateInfo {
  treasuryAddress: string;
  creator: string;
  name: string;
  cause: string;
  causeAddress: string;
  causePercentage: number;
  createdAt: number;
  active: boolean;
  lensProfileId: number;
}
