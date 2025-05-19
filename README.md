# Syndicate Frontend

Syndicate leverages the Lens Protocol SocialFi stack on Megapot's onchain lottery system, creating a powerful social coordination layer for lottery participation. By pooling resources with your social connections, you dramatically increase your collective chances of winning while embedding shared values into smart contracts. When your group pledges portions of potential winnings to causes like ocean cleanup or food aid, these commitments are automatically executed upon winning—transforming social connections into financial impact.

## Project Vision

Syndicate leverages Lens protocol on Megapot's lottery system to create a powerful SocialFi coordination layer. By branding your Syndicate around causes like ocean cleanup, you attract like-minded individuals, dramatically increasing collective winning chances.

Each Syndicate flexibly allocates winnings—perhaps 20% to the featured cause and 80% distributed among participants—with these proportions encoded in smart contracts that execute automatically. This creates a win-win: your cause becomes a recruitment tool that grows your Syndicate and improves everyone's odds, while Lens-powered contracts ensure transparent follow-through on both charitable and personal payouts.

The bigger your cause-branded Syndicate grows across the Lens ecosystem, the higher your chances of winning and creating impact while securing your personal share. Why chase the entire pie alone when you can get a generous slice of a much bigger win together?

## Key Features

- **Lens Protocol Integration**: Social features powered by Lens
- **Megapot Lottery System**: Cause-based lottery pools
- **Optimized Performance**: Code splitting, lazy loading, and optimized images
- **Comprehensive Error Handling**: Error boundaries and consistent error handling
- **Modern UI**: Animated backgrounds, GSAP animations, and responsive design

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Copy the environment file: `cp .env.example .env.local`
4. Set your Lens app address and backend URL in `.env.local`
5. Start the development server: `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Tools

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (via Radix UI primitives)
- **Lens Protocol**:
  - `@lens-protocol/client`
  - `@lens-protocol/react`
  - `@lens-chain/sdk`
  - Direct Lens API integration with GraphQL
- **Theme Handling**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Web3 Integration**:
  - [ConnectKit](https://docs.family.co/connectkit) (with Family Wallet)
  - [wagmi](https://wagmi.sh/)
  - [viem](https://viem.sh/)
- **Form Handling**:
  - [react-hook-form](https://react-hook-form.com/)
  - [zod](https://zod.dev/) (validation)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## Best Practices

- Use the organized component structure
- Add proper TypeScript types for all components
- Implement error handling with the ErrorBoundary component
- Use the OptimizedImage component for all images
- Implement lazy loading for heavy components
- Use React.memo and useMemo for performance optimization

### Secure API Key Handling

For security reasons, we handle API keys like the Decent.xyz API key through server-side API routes:

1. **Environment Variables**: API keys are stored in `.env.local` without the `NEXT_PUBLIC_` prefix to ensure they're only available server-side
2. **API Routes**: We use Next.js API routes in `/app/api/` to securely proxy requests to external services
3. **Client-Side Code**: Frontend components make requests to our API routes instead of directly to external APIs

This approach prevents API keys from being exposed in client-side code, protecting them from unauthorized use.

## Lens Profile Integration

Syndicate natively integrates with Lens Protocol to create a social-first experience for lottery pools. This integration enables users to view which Lens profiles are participating in syndicates, increasing social proof and engagement.

### Profile Integration Architecture

The Lens profile integration uses a dual-API approach for resilience:

1. **Primary: Direct Lens API with GraphQL**

   - Directly queries the Lens GraphQL API at `https://api-v2.lens.dev/`
   - Fetches complete profile data including follower counts, display names, and avatars
   - Supports searching by both Lens handles and Ethereum addresses

2. **Fallback: Web3.bio API**
   - Serves as a reliable fallback when the Lens API is unavailable
   - Simplified profile data via REST endpoints
   - Compatible with the same interface as the primary implementation

### Core Components

#### UI Components

- **LensProfileAvatar**: A versatile avatar component that displays Lens profiles

  - Supports different sizes (xs, sm, md, lg, xl)
  - Shows tooltips with profile information on hover
  - Links directly to Hey.xyz profile pages
  - Gracefully falls back to wallet addresses when profiles aren't available

- **LensProfileGroup**: Displays collections of Lens profiles in an optimized layout
  - Shows overlapping avatars with configurable stacking
  - Includes "+X more" indicators for larger groups
  - Lazy-loads profile data as needed

#### API Layer

- **profiles.ts**: Core API functions for fetching Lens profiles
  - `fetchLensProfile(handleOrAddress)`: Gets a single profile by handle or address
  - `fetchLensProfilesByAddresses(addresses)`: Fetches multiple profiles by their addresses
  - `fetchLensProfilesByIds(profileIds)`: Gets profiles by their Lens profile IDs
  - Includes helper functions for formatting handles and generating profile links

### Implementation Examples

The integration is demonstrated in several components:

1. **SyndicateCard**: Shows the creator's Lens profile and member profiles
2. **SyndicateDashboard**: Displays detailed Lens profile information for members
3. **Test Page**: A comprehensive demo at `/test/lens-profiles` showcases different implementations

### Sample Popular Lens Profiles

For testing and demonstration, the following Lens profiles are used:

- stani.lens
- vitalik.lens
- yoginth.lens
- papajams.lens

### Next Steps

Future enhancements to the Lens integration include:

- Integration with Lens posts for syndicate announcements
- Follow/unfollow functionality directly from syndicate interfaces
- Lens publications when syndicates win or reach milestones
- Advanced filtering and discovery based on social connections

## Cross-Chain Architecture (Lens Chain + Base Chain)

Syndicate operates across two blockchains: Lens Chain (for social and treasury) and Base Chain (for Megapot lottery). Below is our cross-chain integration strategy using Across Protocol as the primary bridging solution.

#### Lens Chain Mainnet Configuration

| Field              | Value                     |
| ------------------ | ------------------------- |
| Network Name       | Lens Chain Mainnet        |
| RPC URL            | https://rpc.lens.xyz      |
| Chain ID           | 232                       |
| Currency Symbol    | GHO                       |
| Block Explorer URL | https://explorer.lens.xyz |

### Bridge Provider

We currently use **Across Protocol** for cross-chain transactions between Lens Chain and Base Chain:

- **Across Protocol**: An intent-based bridging solution that natively supports Lens Chain
- **Across SpokePool on Lens Chain**: `0xe7cb3e167e7475dE1331Cf6E0CEb187654619E12`
- **Future Support**: Decent.xyz integration is implemented but disabled until they add support for Lens Chain

### Deployed Safe Wallets

We've deployed multi-signature Safe wallets on both chains:

- **Lens Chain Treasury**: `0xA27B07399DA4eEC1eE0FbdB4Dd4ADc64Ba1E617F`
- **Base Chain Treasury**: `0x1342Ded441A8AD566a9A9a1204aDE83fdaaA4b0B`

These wallets serve as our treasury and registry contracts, handling funds across chains.

### Key Components

#### Smart Contracts on Lens Chain

- **SyndicateFactory**: Creates new Syndicates - 0x4996089d644d023F02Bf891E98a00b143201f133
- **SyndicateRegistry**: Stores Syndicate metadata (cause, payout percentages)
  - Deployed at 0x399f080bB2868371D7a0024a28c92fc63C05536E
- **SyndicateTreasury**: Manages funds and cross-chain operations [combined with SyndicateFactory] (Safe: `0xA27B07399DA4eEC1eE0FbdB4Dd4ADc64Ba1E617F`)
- **SyndicateIntentResolver**: Processes intent-based operations (for NEAR Intents approach)
  - Deployed at `0x21F6514fdabaD6aB9cB227ddE69A1c34C9cF9014`

#### Smart Contracts on Base Chain

- **TicketRegistry**: Maps ticket IDs to Syndicate addresses (Deployed at: `0x86e2d8A3eAcfa89295a75116e9489f07CFBd198B`)
- **CrossChainResolver**: Handles winning events and initiates bridges (Deployed at: `0x07B73B99fbB0F82f981A5954A7f3Fd72Ce391c2F`)
- **Megapot Lottery Contract**: The lottery system that determines winners (Deployed at: `0xbEDd4F2beBE9E3E636161E644759f3cbe3d51B95`)
- **USDC Token on Base**: Prize token used for lottery (Address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- **BaseChainIntentResolver**: Processes intents received from Lens Chain (for NEAR Intents approach)
  - Deployed at `0xecF8095577EA91cFd1aBe6f59Aaad597622a9Fd3`

### Cross-Chain Flows

#### Ticket Purchase Flow

1. Users contribute GHO to their Syndicate on Lens Chain
2. SyndicateTreasury initiates cross-chain transaction via Across Protocol
3. Tickets are purchased on Base Chain through Megapot contract
4. Ticket IDs are mapped to Syndicate address in TicketRegistry

#### Winning Flow

1. Event listener monitors for winning events on Base Chain
2. When a Syndicate wins, CrossChainResolver initiates bridge back to Lens Chain
3. Funds arrive at SyndicateTreasury on Lens Chain
4. Treasury distributes winnings (e.g., 20% to cause, 80% to participants)

### Implementation Timeline

#### Phase 1: Core Infrastructure ✅

- Deploy basic smart contracts on both chains
- Set up Safe wallets for treasury management
- Implement cross-chain communication via Decent.xyz
- Create ticket purchase flow

#### Phase 2: Enhanced Features (In Progress)

- Test cross-chain functionality with real tokens (GHO → USDC)
- Event monitoring system for wins
- Automated distribution
- Lens social features integration

#### Phase 3: Scale & Optimize

- Batched transactions
- Gas optimizations
- Enhanced analytics

### Technical Challenges & Solutions

1. **Cross-Chain Data Consistency**: Implement event indexer that monitors both chains
2. **Gas Costs**: Batch transactions and optimize contract design
3. **Security**: Multi-step verification for large withdrawals, using Safe multi-sig for treasury management
4. **User Experience**: Abstract complexity with streamlined UI

### Current Progress

We have successfully:

1. Deployed Safe wallets on both Lens and Base chains
2. Deployed all core smart contracts:
   - SyndicateRegistry on Lens Chain: `0x399f080bB2868371D7a0024a28c92fc63C05536E`
   - SyndicateFactory on Lens Chain: `0x4996089d644d023F02Bf891E98a00b143201f133`
   - TicketRegistry on Base Chain: `0x86e2d8A3eAcfa89295a75116e9489f07CFBd198B`
   - CrossChainResolver on Base Chain: `0x07B73B99fbB0F82f981A5954A7f3Fd72Ce391c2F`
   - SyndicateIntentResolver on Lens Chain: `0x21F6514fdabaD6aB9cB227ddE69A1c34C9cF9014`
   - BaseChainIntentResolver on Base Chain: `0xecF8095577EA91cFd1aBe6f59Aaad597622a9Fd3`
3. Implemented cross-chain service using Across Protocol with the new `@across-protocol/app-sdk` package
4. Created UI components for purchasing tickets with GHO on Lens Chain
5. Developed cross-chain test pages at:
   - `/test/across-bridge` - Test Across Protocol API integration
   - `/test/across-sdk` - Test Across Protocol SDK integration
   - `/test/bridge-comparison` - Compare different bridge implementations
6. Updated the Across Protocol integration to use the newer `@across-protocol/app-sdk` package:
   - Created `across-app-sdk-service.ts` for interacting with the Across Protocol SDK
   - Implemented `use-across-app-sdk.ts` hook for using the service in React components
   - Updated the SafeApproach component to use the new SDK

Next steps are:

1. Connecting the TicketRegistry to the CrossChainResolver
2. Configuring bridge addresses for cross-chain operations
3. Setting the GHO token address on the SyndicateTreasury
4. Testing token transfers between Lens Chain and Base Chain
5. Implementing winning detection and prize distribution

For detailed implementation, see the development documentation.

## Cross-Chain Technology Roadmap

Syndicate offers three distinct approaches for enabling users to buy lottery tickets on Base Chain from Lens Chain, each with different tradeoffs in terms of security, user experience, and implementation complexity. These options provide syndicates with flexibility to differentiate themselves based on their specific needs.

### 1. Safe Accounts + Bridging

This approach uses multi-signature Safe wallets as treasuries with Across Protocol for bridging:

- **How it works**: Users contribute GHO to a Safe wallet on Lens Chain (Chain ID: 232), which then bridges funds to a corresponding Safe wallet on Base Chain (Chain ID: 8453) for ticket purchases
- **Benefits**:
  - Enhanced security through multi-signature protection
  - Leveraging established cross-chain infrastructure with native Lens Chain support
  - Using the official SDK maintained by Risk Labs for better performance and security
- **Implementation Status**: Fully implemented and operational
  - **Lens Chain Treasury**: `0xA27B07399DA4eEC1eE0FbdB4Dd4ADc64Ba1E617F`
  - **Base Chain Treasury**: `0x1342Ded441A8AD566a9A9a1204aDE83fdaaA4b0B`
- **Integration Options**:
  - **API Implementation**: Uses the public Across API endpoints directly
  - **SDK Implementation**: Uses the official `@across-protocol/app-sdk` package for direct integration (recommended)
  - **Implementation Files**:
    - `src/lib/cross-chain/across-app-sdk-service.ts` - Service for interacting with the Across Protocol SDK
    - `src/hooks/use-across-app-sdk.ts` - React hook for using the service
    - `src/components/megapot/cross-chain/SafeApproach.tsx` - UI component for the Safe Accounts + Bridging approach
- **Use Case**: Ideal for larger syndicates with significant treasury funds requiring multiple approvals

### 2. Syndicate Smart Contracts

This is our primary implementation using custom smart contracts on both chains:

- **How it works**: Users contribute to SyndicateTreasury contracts on Lens Chain (Chain ID: 232), which handle cross-chain operations via bridges to Base Chain (Chain ID: 8453)
- **Benefits**:
  - Customizable logic and transparent on-chain operations
  - Automatic distribution based on predefined rules
  - Potentially lower fees and more direct control
- **Components**:
  - **Lens Chain**: SyndicateRegistry (0x399f080bB2868371D7a0024a28c92fc63C05536E), SyndicateFactory (0x4996089d644d023F02Bf891E98a00b143201f133), SyndicateTreasury
  - **Base Chain**: TicketRegistry, CrossChainResolver
- **Implementation Status**: Core contracts deployed, integration in progress
- **Use Case**: Standard approach for most syndicates, balancing security and flexibility

### 3. NEAR Intents

An advanced approach inspired by NEAR's intent-based architecture:

- **How it works**: Users submit an "intent" (e.g., "join syndicate with 10 GHO") on Lens Chain (Chain ID: 232), and resolver contracts determine the optimal execution path across chains
- **Benefits**:
  - Improved UX with single transaction for users
  - Gas optimization through optimal execution paths
  - More flexible execution strategies
- **Components**:
  - **Lens Chain**: SyndicateIntentResolver (Deployed at `0x21F6514fdabaD6aB9cB227ddE69A1c34C9cF9014`)
  - **Base Chain**: BaseChainIntentResolver (Deployed at `0xecF8095577EA91cFd1aBe6f59Aaad597622a9Fd3`)
  - **Across SpokePool** on Lens Chain: `0xe7cb3e167e7475dE1331Cf6E0CEb187654619E12`
- **Implementation Status**: ✅ Fully deployed and operational
- **Use Case**: Enhanced user experience for syndicates prioritizing seamless interactions

### Implementation Timeline

#### Phase 1: Safe Accounts + Bridging ✅

- Deploy Safe wallets on both chains
- Implement Across Protocol integration
- Create basic UI for cross-chain operations
- Test with real tokens (GHO → USDC)

#### Phase 2: Syndicate Smart Contracts (In Progress)

- Deploy core contracts on both chains
- Connect contracts to bridge infrastructure
- Implement event monitoring
- Create UI for contract interaction

#### Phase 3: NEAR Intents ✅

- ✅ Complete intent resolver contracts
- ✅ Deploy SyndicateIntentResolver on Lens Chain at `0x21F6514fdabaD6aB9cB227ddE69A1c34C9cF9014`
- ✅ Deploy BaseChainIntentResolver on Base Chain at `0xecF8095577EA91cFd1aBe6f59Aaad597622a9Fd3`
- ✅ Configure with Across Protocol SpokePool at `0xe7cb3e167e7475dE1331Cf6E0CEb187654619E12`
- ✅ Develop off-chain relayer infrastructure:
  - Implemented OffChainProcessor with WebSocket event monitoring
  - Set up database integration for intent and transaction tracking
  - Created graceful error handling with proper connection management
- Next steps: Create UI for intent submission

### Syndicate Differentiation Opportunities

These different cross-chain approaches allow syndicates to differentiate themselves:

- **Security-Focused Syndicates**: May prefer the Safe wallet approach with additional verification
- **User Experience Syndicates**: May adopt intent-based approaches for seamless interactions
- **Cost-Optimized Syndicates**: May implement direct smart contract integration with batched transactions

We're committed to providing options that allow syndicates to choose the approach that best aligns with their values and user needs.
