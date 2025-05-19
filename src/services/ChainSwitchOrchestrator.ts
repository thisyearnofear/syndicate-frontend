import { CHAIN_IDS, getLensChainById, isLensChain } from "@/lib/wagmi-chains";
import { updateActiveChain } from "@/lib/lens/client";
import { Chain } from "viem";

// Events that can be triggered during chain switching
export enum ChainSwitchEvent {
  STARTED = "started",
  WALLET_UPDATED = "wallet_updated",
  LENS_CLIENT_UPDATED = "lens_client_updated",
  COMPLETED = "completed",
  FAILED = "failed",
}

// Type for event listeners
type ChainSwitchListener = (event: ChainSwitchEvent, data?: any) => void;

// Type for switchChain function from wagmi
type SwitchChainFn = (params: { chainId: number }) => Promise<void>;

/**
 * Orchestrates the multi-step process of switching chains
 * Ensures proper sequence of operations and handles error cases
 */
class ChainSwitchOrchestrator {
  private listeners: ChainSwitchListener[] = [];
  private switching = false;

  /**
   * Subscribe to chain switching events
   * @param listener Function to call when events occur
   * @returns Unsubscribe function
   */
  subscribe(listener: ChainSwitchListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Emit an event to all listeners
   */
  private emit(event: ChainSwitchEvent, data?: any): void {
    this.listeners.forEach((listener) => listener(event, data));
  }

  /**
   * Handle chain change detected by wagmi
   * This is called when the wallet reports a chain change
   */
  handleChainChange(chainId: number): void {
    if (!isLensChain(chainId)) {
      console.log(
        `Chain ${chainId} is not a Lens chain, not updating Lens clients`
      );
      return;
    }

    try {
      // Update the Lens client with the new chain
      updateActiveChain(chainId);

      // Get additional chain details
      const chainDetails = getLensChainById(chainId);

      console.log(
        `Successfully updated Lens client to chain ${chainId} (${chainDetails.name})`
      );
      this.emit(ChainSwitchEvent.LENS_CLIENT_UPDATED, {
        chainId,
        chainDetails,
      });
    } catch (error) {
      console.error("Error updating Lens client:", error);
      this.emit(ChainSwitchEvent.FAILED, {
        reason: "Failed to update Lens client",
        error,
      });
    }
  }

  /**
   * Perform a full orchestrated chain switch including:
   * 1. Request wallet to switch chains
   * 2. Update Lens clients and configurations
   * 3. Refresh any dependent data
   */
  async switchChain(
    switchChainFn: SwitchChainFn,
    targetChainId: number
  ): Promise<boolean> {
    // Prevent concurrent switching
    if (this.switching) {
      console.warn("Chain switch already in progress, ignoring request");
      return false;
    }

    try {
      this.switching = true;
      this.emit(ChainSwitchEvent.STARTED, { targetChainId });

      // Step 1: Request wallet to switch chains
      console.log(`Requesting wallet to switch to chain ${targetChainId}`);
      await switchChainFn({ chainId: targetChainId });

      // Get chain details for the event
      const chainDetails = getLensChainById(targetChainId);

      this.emit(ChainSwitchEvent.WALLET_UPDATED, {
        chainId: targetChainId,
        chainDetails,
      });
      console.log(
        `Wallet successfully switched to ${chainDetails.name} (${targetChainId})`
      );

      // Step 2: Update Lens client (if it's a Lens chain)
      // Note: We don't need to manually call updateActiveChain here as it will
      // be triggered by the ChainSynchronizer component when the chain changes

      // Step 3: Signal completion
      this.emit(ChainSwitchEvent.COMPLETED, {
        chainId: targetChainId,
        chainDetails,
      });
      console.log(
        `Chain switch to ${chainDetails.name} completed successfully`
      );

      return true;
    } catch (error) {
      console.error(`Failed to switch to chain ${targetChainId}:`, error);
      this.emit(ChainSwitchEvent.FAILED, {
        targetChainId,
        reason: "Chain switch failed",
        error,
      });
      return false;
    } finally {
      this.switching = false;
    }
  }

  /**
   * Switch to Lens Mainnet
   */
  async switchToLensMainnet(switchChainFn: SwitchChainFn): Promise<boolean> {
    return this.switchChain(switchChainFn, CHAIN_IDS.LENS_MAINNET);
  }

  /**
   * Switch to Lens Testnet
   */
  async switchToLensTestnet(switchChainFn: SwitchChainFn): Promise<boolean> {
    return this.switchChain(switchChainFn, CHAIN_IDS.LENS_TESTNET);
  }
}

// Export a singleton instance
export const chainSwitchOrchestrator = new ChainSwitchOrchestrator();

// Export the class for testing or advanced usage
export default ChainSwitchOrchestrator;
