import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWalletClient,
} from "wagmi";
import {
  PublicClient,
  WalletClient,
  Address,
  parseUnits,
  formatUnits,
  parseEther,
} from "viem";
import { createPublicClient, http } from "viem";
import { ChainId, CHAINS, getChainTransport } from "@/lib/cross-chain/config";
import { alchemyHttp } from "@/lib/alchemy-transport";
import {
  getContractAddress,
  SyndicateInfo,
} from "@/lib/cross-chain/contract-config";
import { SyndicateRegistryABI } from "@/lib/cross-chain/abis/SyndicateRegistry";
import { SyndicateFactoryABI } from "@/lib/cross-chain/abis/SyndicateFactory";
import { useAcrossAppSdk } from "@/hooks/use-across-app-sdk";

export interface SyndicateHookResult {
  userSyndicates: SyndicateInfo[];
  isLoadingSyndicates: boolean;
  createSyndicate: (
    name: string,
    cause: string,
    causeAddress: string,
    causePercentage: number
  ) => Promise<string | null>;
  isCreatingSyndicate: boolean;
  createSyndicateError: Error | null;
  bridgeToBaseTreasury: (
    syndicateTreasury: string,
    amount: string
  ) => Promise<void>;
  isBridging: boolean;
  bridgeError: Error | null;
  selectedSyndicate: SyndicateInfo | null;
  setSelectedSyndicate: (syndicate: SyndicateInfo | null) => void;
}

export function useSyndicateContracts(): SyndicateHookResult {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [userSyndicates, setUserSyndicates] = useState<SyndicateInfo[]>([]);
  const [isLoadingSyndicates, setIsLoadingSyndicates] = useState(false);
  const [isCreatingSyndicate, setIsCreatingSyndicate] = useState(false);
  const [createSyndicateError, setCreateSyndicateError] =
    useState<Error | null>(null);
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeError, setBridgeError] = useState<Error | null>(null);
  const [selectedSyndicate, setSelectedSyndicate] =
    useState<SyndicateInfo | null>(null);

  const { bridgeTokens } = useAcrossAppSdk();

  // Get client for Lens chain
  const getLensClient = useCallback(() => {
    // Get the RPC URL directly from the config
    const rpcUrl = CHAINS[ChainId.LENS].rpcUrl;

    console.log("Creating Lens client with RPC URL:", rpcUrl);

    // Get the custom transport for Alchemy if available
    const customTransport = getChainTransport(ChainId.LENS);

    return createPublicClient({
      chain: {
        id: ChainId.LENS,
        name: "Lens Chain",
        network: "lens",
        nativeCurrency: {
          name: "GHO",
          symbol: "GHO",
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [rpcUrl],
          },
          public: {
            http: [rpcUrl, "https://rpc.lens.xyz"], // Add public fallback
          },
        },
      },
      transport: customTransport || http(rpcUrl),
    });
  }, []);

  // Load user's syndicates from the registry
  const loadUserSyndicates = useCallback(async () => {
    if (!address) return;

    try {
      setIsLoadingSyndicates(true);

      // Create a new client instance for each request to ensure fresh configuration
      const lensClient = getLensClient();

      // Verify chain connection before proceeding
      try {
        const chainId = await lensClient.getChainId();
        console.log("Connected to chain ID:", chainId);

        if (chainId !== ChainId.LENS) {
          console.warn(`Connected to chain ID ${chainId}, but expected Lens Chain (${ChainId.LENS})`);
        }
      } catch (chainError) {
        console.error("Failed to get chain ID:", chainError);
        throw new Error("Could not connect to Lens Chain. Please check your network connection.");
      }

      const registryAddress = getContractAddress(
        ChainId.LENS,
        "SYNDICATE_REGISTRY"
      ) as Address;

      console.log("Using registry address:", registryAddress);

      // Verify the contract exists
      try {
        const code = await lensClient.getBytecode({ address: registryAddress });
        if (!code || code === "0x") {
          throw new Error(`No contract found at address ${registryAddress}`);
        }
        console.log("Registry contract verified at", registryAddress);
      } catch (contractError) {
        console.error("Contract verification error:", contractError);
        throw new Error(`Failed to verify registry contract at ${registryAddress}`);
      }

      // Get syndicate count with better error handling
      let count: bigint;
      try {
        count = (await lensClient.readContract({
          address: registryAddress,
          abi: SyndicateRegistryABI,
          functionName: "getSyndicateCount",
        })) as bigint;

        console.log("Total syndicate count:", count.toString());
      } catch (countError) {
        console.error("Failed to get syndicate count:", countError);
        throw new Error("Failed to read syndicate count from registry");
      }

      // Get all syndicate addresses
      const limit = 10n; // Fetch 10 at a time
      const syndicateAddresses = [];

      for (let offset = 0n; offset < count; offset += limit) {
        const batchSize = offset + limit > count ? count - offset : limit;
        try {
          const addresses = (await lensClient.readContract({
            address: registryAddress,
            abi: SyndicateRegistryABI,
            functionName: "getSyndicatePaginated",
            args: [offset, batchSize],
          })) as Address[];

          syndicateAddresses.push(...addresses);
        } catch (paginationError) {
          console.error(`Failed to get syndicates at offset ${offset}:`, paginationError);
          // Continue with the next batch instead of failing completely
        }
      }

      console.log("Retrieved syndicate addresses:", syndicateAddresses.length);

      // Get details for each syndicate
      const syndicates: SyndicateInfo[] = [];

      for (const treasuryAddress of syndicateAddresses) {
        try {
          const data = (await lensClient.readContract({
            address: registryAddress,
            abi: SyndicateRegistryABI,
            functionName: "syndicates",
            args: [treasuryAddress],
          })) as any[];

          const syndicate: SyndicateInfo = {
            treasuryAddress: data[0] as string,
            creator: data[1] as string,
            name: data[2] as string,
            cause: data[3] as string,
            causeAddress: data[4] as string,
            causePercentage: Number(data[5]),
            createdAt: Number(data[6]),
            active: data[7] as boolean,
            lensProfileId: Number(data[8]),
          };

          // Only add syndicates created by the current user
          if (syndicate.creator.toLowerCase() === address.toLowerCase()) {
            syndicates.push(syndicate);
          }
        } catch (syndicateError) {
          console.error(`Failed to get details for syndicate ${treasuryAddress}:`, syndicateError);
          // Continue with the next syndicate instead of failing completely
        }
      }

      console.log("User syndicates found:", syndicates.length);
      setUserSyndicates(syndicates);
    } catch (error) {
      console.error("Error loading syndicates:", error);
    } finally {
      setIsLoadingSyndicates(false);
    }
  }, [address, getLensClient]);

  // Create a new syndicate
  const createSyndicate = useCallback(
    async (
      name: string,
      cause: string,
      causeAddress: string,
      causePercentage: number
    ): Promise<string | null> => {
      if (!walletClient || !address) return null;

      try {
        setIsCreatingSyndicate(true);
        setCreateSyndicateError(null);

        const factoryAddress = getContractAddress(
          ChainId.LENS,
          "SYNDICATE_FACTORY"
        ) as Address;

        // Validate inputs
        if (!name || !cause || !causeAddress) {
          throw new Error("All fields are required");
        }

        if (causePercentage < 0 || causePercentage > 100) {
          throw new Error("Cause percentage must be between 0 and 100");
        }

        // Get the Lens client for gas estimation
        const lensClient = getLensClient();

        // Convert percentage to basis points (5% = 500)
        const causePercentageBasisPoints = causePercentage * 100;

        // Set up owners array with the creator as the initial owner
        const owners = [address as Address];
        const threshold = 1n; // Single owner requires 1 confirmation

        // Prepare transaction data
        const tx = {
          address: factoryAddress,
          abi: SyndicateFactoryABI,
          functionName: "createSyndicate",
          args: [
            name,
            cause,
            causeAddress as Address,
            BigInt(causePercentageBasisPoints),
            owners, // Add owners array
            threshold, // Add threshold
          ],
          account: address as Address,
          chain: {
            ...CHAINS[ChainId.LENS],
            id: ChainId.LENS,
            name: "Lens Chain",
            network: "lens",
            nativeCurrency: {
              name: "GHO",
              symbol: "GHO",
              decimals: 18,
            },
            rpcUrls: {
              default: {
                http: [CHAINS[ChainId.LENS].rpcUrl],
              },
              public: {
                http: [CHAINS[ChainId.LENS].rpcUrl],
              },
            },
            blockExplorers: {
              default: {
                name: "Lens Explorer",
                url: CHAINS[ChainId.LENS].blockExplorerUrl,
              },
            },
          },
        };

        // Get current block to check network status
        const block = await lensClient.getBlock();
        console.log("Current block:", block);

        // Verify chain state
        const chainId = await lensClient.getChainId();
        console.log("Current chain ID:", chainId);

        if (chainId !== ChainId.LENS) {
          throw new Error(
            `Wrong chain. Expected Lens Chain (${ChainId.LENS}) but got chain ID ${chainId}`
          );
        }

        // Get gas price with fallback
        let gasPrice;
        try {
          gasPrice = await lensClient.getGasPrice();
          console.log("Gas price:", gasPrice);
        } catch (error) {
          console.error("Failed to get gas price:", error);
          // Use a fallback gas price if needed
          gasPrice = parseUnits("0.1", 9); // 0.1 Gwei as fallback
        }

        // Verify the contract exists at the target address
        const code = await lensClient.getBytecode({ address: factoryAddress });
        if (!code) {
          throw new Error(`No contract found at address ${factoryAddress}`);
        }
        console.log("Contract exists at target address");

        // Estimate gas with proper error handling
        let gasEstimate;
        try {
          gasEstimate = await lensClient.estimateGas({
            ...tx,
            gasPrice,
          });
          console.log("Gas estimate:", gasEstimate);
        } catch (error: any) {
          console.error("Gas estimation failed:", error);

          // Check for specific error messages
          const errorMessage = error.message?.toLowerCase() || "";
          if (errorMessage.includes("execution reverted")) {
            throw new Error(
              "Contract rejected the transaction. Please check your inputs and try again."
            );
          } else if (errorMessage.includes("insufficient funds")) {
            const balance = await lensClient.getBalance({ address });
            throw new Error(
              `Insufficient GHO balance. You have ${formatUnits(
                balance,
                18
              )} GHO`
            );
          }

          throw new Error(
            "Failed to estimate gas. The transaction might fail."
          );
        }

        // Add 50% buffer to gas estimate for safety on Lens chain
        const gasLimit = (gasEstimate * 150n) / 100n;

        // Calculate total gas cost
        const gasCostInGHO = gasLimit * gasPrice;
        console.log("Gas cost in GHO:", formatUnits(gasCostInGHO, 18));

        // Get user's GHO balance
        const balance = await lensClient.getBalance({ address });
        console.log("User balance in GHO:", formatUnits(balance, 18));

        // Check if user has enough GHO
        if (balance < gasCostInGHO) {
          throw new Error(
            `Insufficient GHO for gas. Required: ${formatUnits(
              gasCostInGHO,
              18
            )} GHO, You have: ${formatUnits(balance, 18)} GHO`
          );
        }

        // Create the syndicate with explicit gas settings
        // Note: Using legacy gasPrice for Lens chain as it might not support EIP-1559
        const txHash = await walletClient.writeContract({
          address: factoryAddress,
          abi: SyndicateFactoryABI,
          functionName: "createSyndicate",
          args: [
            name,
            cause,
            causeAddress as Address,
            BigInt(causePercentageBasisPoints),
            owners,
            threshold,
          ],
          account: address as Address,
          chain: {
            ...CHAINS[ChainId.LENS],
            id: ChainId.LENS,
            name: "Lens Chain",
            network: "lens",
            nativeCurrency: {
              name: "GHO",
              symbol: "GHO",
              decimals: 18,
            },
            rpcUrls: {
              default: {
                http: [CHAINS[ChainId.LENS].rpcUrl],
              },
              public: {
                http: [CHAINS[ChainId.LENS].rpcUrl],
              },
            },
            blockExplorers: {
              default: {
                name: "Lens Explorer",
                url: CHAINS[ChainId.LENS].blockExplorerUrl,
              },
            },
          },
          gas: gasLimit,
          gasPrice,
        });

        console.log("Transaction submitted:", txHash);

        // Wait for transaction with timeout and proper error handling
        let receipt;
        try {
          receipt = (await Promise.race([
            lensClient.waitForTransactionReceipt({
              hash: txHash,
              timeout: 60_000, // 60 second timeout
              confirmations: 2, // Wait for 2 confirmations
            }),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Transaction confirmation timed out")),
                60_000
              )
            ),
          ])) as any;

          console.log("Transaction receipt:", receipt);

          // Check transaction status more thoroughly
          if (
            !receipt ||
            receipt.status === "reverted" ||
            receipt.status === 0 ||
            receipt.status === "0x0"
          ) {
            // Try to get more detailed error information
            try {
              const simulation = await lensClient.simulateContract({
                ...tx,
                account: address as Address,
                gas: gasLimit,
                gasPrice,
                value: 0n, // Explicitly set value to 0
              });

              console.error("Simulation result:", simulation);

              // Check if simulation has any error data
              const simulationError = (simulation as any).error;
              if (simulationError) {
                throw new Error(`Simulation failed: ${simulationError}`);
              }
            } catch (simError: any) {
              console.error("Simulation error details:", simError);

              // Check for common revert reasons
              const errorMessage = simError?.message?.toLowerCase() || "";
              if (errorMessage.includes("insufficient allowance")) {
                throw new Error(
                  "Transaction failed: Insufficient allowance for token transfer"
                );
              } else if (errorMessage.includes("insufficient balance")) {
                throw new Error("Transaction failed: Insufficient balance");
              } else if (errorMessage.includes("invalid percentage")) {
                throw new Error(
                  "Transaction failed: Invalid cause percentage. Must be between 5% and 50%"
                );
              } else if (errorMessage.includes("bootloader")) {
                // Handle bootloader specific errors
                throw new Error(
                  "Transaction failed at the network level. This might be due to:\n" +
                    "1. Network congestion\n" +
                    "2. Incorrect gas settings\n" +
                    "3. Contract state requirements not met\n" +
                    `Please try again or check the explorer: https://explorer.lens.xyz/tx/${txHash}`
                );
              } else {
                throw new Error(
                  `Transaction failed. Please check the explorer: https://explorer.lens.xyz/tx/${txHash}\n` +
                    `Error: ${simError?.message || "Unknown error"}`
                );
              }
            }
          }

          // Check if we got any events
          if (!receipt.logs || receipt.logs.length === 0) {
            throw new Error(
              `Transaction completed but no events were emitted. Please check the explorer: https://explorer.lens.xyz/tx/${txHash}`
            );
          }

          // Find the SyndicateCreated event
          let treasuryAddress: string | null = null;
          let foundEvent = false;

          // Loop through logs to find the event
          for (const log of receipt.logs) {
            if (log.address.toLowerCase() === factoryAddress.toLowerCase()) {
              try {
                const syndicateCreatedTopic =
                  "0x9a1dc089f9db31681ba593880bd3aff9b2b9bd9e0f20474c489a5768d42e733e";

                if (
                  log.topics[0] &&
                  log.topics[0] === syndicateCreatedTopic &&
                  log.topics[1]
                ) {
                  treasuryAddress = "0x" + log.topics[1].slice(26);
                  foundEvent = true;
                  break;
                }
              } catch (e) {
                console.error("Error parsing log:", e);
              }
            }
          }

          if (!foundEvent) {
            console.error("All transaction logs:", receipt.logs);
            throw new Error(
              "Transaction completed but SyndicateCreated event was not found. " +
                `Please check the explorer: https://explorer.lens.xyz/tx/${txHash}`
            );
          }

          if (!treasuryAddress) {
            throw new Error(
              "Failed to extract treasury address from event. " +
                `Please check the explorer: https://explorer.lens.xyz/tx/${txHash}`
            );
          }

          // Load the newly created syndicate
          await loadUserSyndicates();

          return treasuryAddress;
        } catch (error: any) {
          console.error("Error creating syndicate:", error);
          setCreateSyndicateError(
            new Error(error.message || "Failed to create syndicate")
          );
          return null;
        } finally {
          setIsCreatingSyndicate(false);
        }
      } catch (error: any) {
        console.error("Error in transaction flow:", error);
        setCreateSyndicateError(
          new Error(error.message || "Failed to create syndicate")
        );
        return null;
      } finally {
        setIsCreatingSyndicate(false);
      }
    },
    [walletClient, address, loadUserSyndicates, getLensClient]
  );

  // Bridge tokens from Lens Chain to Base Chain
  const bridgeToBaseTreasury = useCallback(
    async (syndicateTreasury: string, amount: string) => {
      if (!address) return;

      try {
        setIsBridging(true);
        setBridgeError(null);

        // Parse the amount as bigint, then convert back to string for the bridge function
        const amountInWei = parseUnits(amount, 6); // USDC has 6 decimals

        // Use the Across bridge to send USDC to the treasury on Base
        await bridgeTokens({
          sourceChainId: ChainId.LENS,
          destinationChainId: ChainId.BASE,
          sourceToken: "0x88F08E304EC4f90D644Cec3Fb69b8aD414acf884", // USDC on Lens
          destinationToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
          amount: amountInWei.toString(), // Convert bigint to string
          recipient: syndicateTreasury, // The syndicate treasury address on Base
        });
      } catch (error) {
        console.error("Error bridging tokens:", error);
        setBridgeError(error as Error);
      } finally {
        setIsBridging(false);
      }
    },
    [address, bridgeTokens]
  );

  // Load syndicates when the address changes
  useEffect(() => {
    if (address) {
      loadUserSyndicates();
    } else {
      setUserSyndicates([]);
    }
  }, [address, loadUserSyndicates]);

  return {
    userSyndicates,
    isLoadingSyndicates,
    createSyndicate,
    isCreatingSyndicate,
    createSyndicateError,
    bridgeToBaseTreasury,
    isBridging,
    bridgeError,
    selectedSyndicate,
    setSelectedSyndicate,
  };
}
