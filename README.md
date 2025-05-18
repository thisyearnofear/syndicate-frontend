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

## Cross-Chain Architecture (Lens Chain + Base Chain)

Syndicate operates across two blockchains: Lens Chain (for social and treasury) and Base Chain (for Megapot lottery). Below is our cross-chain integration strategy using Decent.xyz as the bridging solution.

### Deployed Safe Wallets

We've deployed multi-signature Safe wallets on both chains:

- **Lens Chain Treasury**: `0xA27B07399DA4eEC1eE0FbdB4Dd4ADc64Ba1E617F`
- **Base Chain Treasury**: `0x1342Ded441A8AD566a9A9a1204aDE83fdaaA4b0B`

These wallets serve as our treasury and registry contracts, handling funds across chains.

### Key Components

#### Smart Contracts on Lens Chain

- **SyndicateFactory**: Creates new Syndicates
- **SyndicateRegistry**: Stores Syndicate metadata (cause, payout percentages)
- **SyndicateTreasury**: Manages funds and cross-chain operations (Safe: `0xA27B07399DA4eEC1eE0FbdB4Dd4ADc64Ba1E617F`)

#### Smart Contracts on Base Chain

- **TicketRegistry**: Maps ticket IDs to Syndicate addresses
- **CrossChainResolver**: Handles winning events and initiates bridges (Safe: `0x1342Ded441A8AD566a9A9a1204aDE83fdaaA4b0B`)

### Cross-Chain Flows

#### Ticket Purchase Flow

1. Users contribute GHO to their Syndicate on Lens Chain
2. SyndicateTreasury initiates cross-chain transaction via Decent.xyz
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
2. Implemented cross-chain service using Decent.xyz
3. Created UI components for purchasing tickets with GHO on Lens Chain
4. Developed cross-chain test page at `/test/cross-chain`

Next steps are testing token transfers on mainnet and implementing winning detection.

For detailed implementation, see the development documentation.

## Cross-Chain Technology Roadmap

As Syndicate evolves, we're exploring multiple approaches to cross-chain integration, each offering different tradeoffs in terms of security, user experience, and implementation complexity. These options will provide syndicates with flexibility to differentiate themselves based on their specific needs.

### Current Approach: Decent.xyz + Safe Wallets

Our current implementation uses Decent.xyz as a bridging solution with Safe multi-signature wallets as treasury and registry contracts. This approach offers:

- **Security**: Multi-signature protection for treasury funds
- **Reliability**: Leveraging established cross-chain infrastructure
- **Moderate Development Complexity**: Faster time-to-market

### Future Alternatives

#### 1. Direct Smart Contract Integration (Now Implemented)

A more direct approach using custom smart contracts on both chains with a cross-chain messaging protocol:

- **How it works**: Custom contracts on both Lens and Base chains communicate directly via protocols like LayerZero, Axelar, or Hyperlane
- **Benefits**: Potentially lower fees, more customizable logic
- **Challenges**: Higher development complexity, requires robust monitoring
- **Implementation**: See `/contracts` directory for the full implementation
- **Status**: Completed core contracts for both chains

#### 2. Intent-Based Cross-Chain Transactions

Inspired by NEAR Intents, this approach focuses on what users want to accomplish rather than how:

- **How it works**: Users submit an "intent" (e.g., "join syndicate with 10 GHO"), and the system determines the optimal execution path
- **Benefits**: Better UX, gas optimization, single transaction for users
- **Challenges**: Complex resolver logic, requires sophisticated infrastructure
- **Timeline**: Q1-Q2 2025

#### 3. Account Abstraction for Cross-Chain Operations

Leveraging ERC-4337 smart accounts to bundle cross-chain operations:

- **How it works**: Smart accounts handle the complexity of cross-chain operations behind the scenes
- **Benefits**: Seamless UX, gas payment in any token, bundled approvals
- **Challenges**: Depends on account abstraction adoption, complex implementation
- **Timeline**: Q3-Q4 2025

### Syndicate Differentiation Opportunities

These different cross-chain approaches will allow syndicates to differentiate themselves:

- **Security-Focused Syndicates**: May prefer the Safe wallet approach with additional verification
- **User Experience Syndicates**: May adopt intent-based or account abstraction approaches
- **Cost-Optimized Syndicates**: May implement direct smart contract integration with batched transactions

We're committed to providing options that allow syndicates to choose the approach that best aligns with their values and user needs.
