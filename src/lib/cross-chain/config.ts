"use client";

// No chain imports needed as we're defining our own chain configurations

// Define chain IDs that work with cross-chain services
export enum ChainId {
  ETHEREUM = 1,
  OPTIMISM = 10,
  ARBITRUM = 42161,
  BASE = 8453,
  LENS = 232, // Lens Chain
  LENS_TESTNET = 37111, // Lens Testnet
  BASE_SEPOLIA = 84532, // Base Sepolia
  ETHEREUM_SEPOLIA = 11155111, // Ethereum Sepolia
}

// Token types
export enum TokenType {
  USDC = "USDC",
  GHO = "GHO",
  GRASS = "GRASS",
  WGRASS = "WGRASS",
  WETH = "WETH",
}

// Bridge types
export enum BridgeType {
  DECENT = "decent",
  ACROSS = "across",
}

// Environment
const isProduction = process.env.NODE_ENV === "production";

// API keys and configuration
export const DECENT_API_KEY = process.env.NEXT_PUBLIC_DECENT_API_KEY || "";
export const ACROSS_INTEGRATOR_ID =
  process.env.NEXT_PUBLIC_ACROSS_INTEGRATOR_ID || "0xdead";
export const USE_TESTNET = !isProduction;

// Testnet token addresses
export const GRASS_ADDRESS_LENS_TESTNET =
  "0x000000000000000000000000000000000000800A"; // GRASS on Lens Testnet (native token)
export const WGRASS_ADDRESS_LENS_TESTNET =
  "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8"; // Wrapped GRASS on Lens Testnet
export const WETH_ADDRESS_LENS_TESTNET =
  "0xaA91D645D7a6C1aeaa5988e0547267B77d33fe16"; // WETH on Lens Testnet
export const USDC_ADDRESS_BASE_SEPOLIA =
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // USDC on Base Sepolia
export const GHO_ADDRESS_LENS_TESTNET = WGRASS_ADDRESS_LENS_TESTNET; // GHO doesn't exist on testnet, use WGRASS as a substitute

// Token addresses
export const USDC_ADDRESS_LENS =
  process.env.NEXT_PUBLIC_USDC_ADDRESS_LENS ||
  "0x88F08E304EC4f90D644Cec3Fb69b8aD414acf884"; // USDC on Lens Chain
export const USDC_ADDRESS_BASE =
  process.env.NEXT_PUBLIC_USDC_ADDRESS_BASE ||
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base
export const GHO_ADDRESS_LENS =
  process.env.NEXT_PUBLIC_GHO_ADDRESS_LENS ||
  "0x6bDc36E20D267Ff0dd6097799f82e78907105e2F"; // GHO on Lens Chain
export const GHO_ADDRESS_ETHEREUM =
  process.env.NEXT_PUBLIC_GHO_ADDRESS_ETHEREUM ||
  "0x1ff1dC3cB9eeDbC6Eb2d99C03b30A05cA625fB5a"; // GHO on Ethereum
export const USDC_ADDRESS_ETHEREUM =
  process.env.NEXT_PUBLIC_USDC_ADDRESS_ETHEREUM ||
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC on Ethereum

// Bridge addresses
export const ACROSS_BRIDGE_LENS =
  process.env.NEXT_PUBLIC_ACROSS_BRIDGE_LENS ||
  "0xe7cb3e167e7475dE1331Cf6E0CEb187654619E12"; // Across bridge on Lens Chain
export const ACROSS_BRIDGE_BASE =
  process.env.NEXT_PUBLIC_ACROSS_BRIDGE_BASE ||
  "0x09aea4b79ec8780a2d3a7615fa28b9c90f702071"; // Across bridge on Base

// Determine which networks to use based on environment
export const SOURCE_CHAIN_ID = ChainId.LENS; // Always use Lens Chain for testing
export const DESTINATION_CHAIN_ID = ChainId.BASE; // Always use Base for testing

// Chain configurations
export const CHAINS = {
  [ChainId.LENS]: {
    id: 232,
    name: "Lens Chain",
    rpcUrl:
      process.env.NEXT_PUBLIC_LENS_CHAIN_RPC_URL || "https://lens-mainnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH",
    usdcAddress:
      process.env.NEXT_PUBLIC_USDC_ADDRESS_LENS ||
      "0x88F08E304EC4f90D644Cec3Fb69b8aD414acf884", // USDC on Lens
    blockExplorerUrl: "https://explorer.lens.xyz",
    nativeCurrency: {
      name: "GHO",
      symbol: "GHO",
      decimals: 18,
    },
    lensProtocol: true,
    ghoEnabled: true,
    ticketPurchaseEnabled: false, // Cannot purchase tickets directly on Lens Chain
  },
  [ChainId.LENS_TESTNET]: {
    id: 37111,
    name: "Lens Chain Testnet",
    rpcUrl:
      process.env.NEXT_PUBLIC_LENS_TESTNET_RPC_URL ||
      "https://lens-testnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH",
    usdcAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Placeholder USDC on Lens Testnet
    blockExplorerUrl: "https://testnet.lensscan.io",
    nativeCurrency: {
      name: "GRASS",
      symbol: "GRASS",
      decimals: 18,
    },
    lensProtocol: true,
    ghoEnabled: true,
    ticketPurchaseEnabled: false, // Cannot purchase tickets directly on Lens Chain
  },
  [ChainId.BASE]: {
    id: 8453,
    name: "Base",
    rpcUrl:
      process.env.NEXT_PUBLIC_BASE_CHAIN_RPC_URL ||
      "https://base-mainnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH",
    usdcAddress:
      process.env.NEXT_PUBLIC_USDC_ADDRESS_BASE ||
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    blockExplorerUrl: "https://basescan.org",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    lensProtocol: false,
    ghoEnabled: false,
    ticketPurchaseEnabled: true, // Can purchase tickets on Base
  },
  [ChainId.ETHEREUM]: {
    id: 1,
    name: "Ethereum",
    rpcUrl:
      process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL ||
      "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    usdcAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Ethereum
    blockExplorerUrl: "https://etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  [ChainId.OPTIMISM]: {
    id: 10,
    name: "Optimism",
    rpcUrl:
      process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
    usdcAddress: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // USDC on Optimism
    blockExplorerUrl: "https://optimistic.etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  [ChainId.ARBITRUM]: {
    id: 42161,
    name: "Arbitrum",
    rpcUrl:
      process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ||
      "https://arb1.arbitrum.io/rpc",
    usdcAddress: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", // USDC on Arbitrum
    blockExplorerUrl: "https://arbiscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  [ChainId.BASE_SEPOLIA]: {
    id: 84532,
    name: "Base Sepolia",
    rpcUrl:
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ||
      "https://sepolia.base.org",
    usdcAddress: USDC_ADDRESS_BASE_SEPOLIA,
    blockExplorerUrl: "https://sepolia.basescan.org",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  [ChainId.ETHEREUM_SEPOLIA]: {
    id: 11155111,
    name: "Ethereum Sepolia",
    rpcUrl:
      process.env.NEXT_PUBLIC_ETHEREUM_SEPOLIA_RPC_URL ||
      "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Ethereum Sepolia
    blockExplorerUrl: "https://sepolia.etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
};

// Contract addresses
export const MEGAPOT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_MEGAPOT_CONTRACT_ADDRESS ||
  "0xbEDd4F2beBE9E3E636161E644759f3cbe3d51B95";

export const SYNDICATE_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_SYNDICATE_REGISTRY_ADDRESS ||
  "0x1342Ded441A8AD566a9A9a1204aDE83fdaaA4b0B"; // Base chain registry/treasury

export const SYNDICATE_TREASURY_ADDRESS =
  process.env.NEXT_PUBLIC_SYNDICATE_TREASURY_ADDRESS ||
  "0xA27B07399DA4eEC1eE0FbdB4Dd4ADc64Ba1E617F"; // Lens chain treasury

// Default values
export const DEFAULT_REFERRER_ADDRESS =
  "0x0000000000000000000000000000000000000000";
export const DEFAULT_CAUSE_PERCENTAGE = 20; // 20% of winnings to cause by default
export const DEFAULT_SLIPPAGE = 1; // 1% slippage
export const USDC_DECIMALS = 6;
export const GHO_DECIMALS = 18;
export const GRASS_DECIMALS = 18; // GRASS has 18 decimals like most ERC20 tokens

// Get token address by chain ID and token type
export function getTokenAddress(
  chainId: ChainId,
  tokenType: TokenType = TokenType.USDC
): string {
  // Check if we're in testnet mode
  if (USE_TESTNET) {
    if (chainId === ChainId.LENS) {
      // Lens Testnet tokens
      if (tokenType === TokenType.GRASS) {
        return GRASS_ADDRESS_LENS_TESTNET;
      } else if (tokenType === TokenType.WGRASS) {
        return WGRASS_ADDRESS_LENS_TESTNET;
      } else if (tokenType === TokenType.WETH) {
        return WETH_ADDRESS_LENS_TESTNET;
      } else if (tokenType === TokenType.GHO) {
        // GHO doesn't exist on testnet, use WGRASS as a substitute
        return WGRASS_ADDRESS_LENS_TESTNET;
      }
    } else if (chainId === ChainId.BASE) {
      return USDC_ADDRESS_BASE_SEPOLIA;
    }
  }

  // Mainnet addresses
  if (chainId === ChainId.LENS && tokenType === TokenType.GHO) {
    return GHO_ADDRESS_LENS;
  } else if (chainId === ChainId.ETHEREUM && tokenType === TokenType.GHO) {
    return GHO_ADDRESS_ETHEREUM;
  } else if (chainId === ChainId.ETHEREUM) {
    return USDC_ADDRESS_ETHEREUM;
  } else if (chainId === ChainId.BASE) {
    return USDC_ADDRESS_BASE;
  }

  // Default to chain's USDC address
  return (
    CHAINS[chainId]?.usdcAddress || "0x0000000000000000000000000000000000000000"
  );
}

// Get token decimals by token type
export function getTokenDecimals(
  tokenType: TokenType = TokenType.USDC
): number {
  switch (tokenType) {
    case TokenType.USDC:
      return USDC_DECIMALS;
    case TokenType.GHO:
      return GHO_DECIMALS;
    case TokenType.GRASS:
    case TokenType.WGRASS:
    case TokenType.WETH:
      return GRASS_DECIMALS; // All these tokens have 18 decimals
    default:
      return USDC_DECIMALS;
  }
}

// Get RPC URL by chain ID
export function getRpcUrl(chainId: ChainId): string {
  return CHAINS[chainId]?.rpcUrl || "";
}

// Get chain name by ID
export function getChainName(chainId: ChainId): string {
  return CHAINS[chainId]?.name || "Unknown Chain";
}

// Get the native token type for a chain
export function getNativeTokenType(chainId: ChainId): TokenType {
  if (chainId === ChainId.LENS) {
    return USE_TESTNET ? TokenType.GRASS : TokenType.GHO;
  }
  return TokenType.USDC; // Default to USDC for other chains
}

// Get the native token name for a chain
export function getNativeTokenName(chainId: ChainId): string {
  if (chainId === ChainId.LENS) {
    return USE_TESTNET ? "GRASS" : "GHO";
  }
  return "USDC"; // Default to USDC for other chains
}
