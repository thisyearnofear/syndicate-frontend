export const SyndicateRegistryABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "treasuryAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "lensProfileId",
        type: "uint256",
      },
    ],
    name: "LensProfileLinked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "treasuryAddress",
        type: "address",
      },
    ],
    name: "SyndicateDeactivated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "treasuryAddress",
        type: "address",
      },
    ],
    name: "SyndicateReactivated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "treasuryAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "cause",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "causeAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "causePercentage",
        type: "uint256",
      },
    ],
    name: "SyndicateRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "treasuryAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "cause",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "causeAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "causePercentage",
        type: "uint256",
      },
    ],
    name: "SyndicateUpdated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_treasuryAddress",
        type: "address",
      },
    ],
    name: "deactivateSyndicate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "factory",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSyndicateCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_offset",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_limit",
        type: "uint256",
      },
    ],
    name: "getSyndicatePaginated",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_treasuryAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_lensProfileId",
        type: "uint256",
      },
    ],
    name: "linkLensProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_treasuryAddress",
        type: "address",
      },
    ],
    name: "reactivateSyndicate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_treasuryAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "_creator",
        type: "address",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_cause",
        type: "string",
      },
      {
        internalType: "address",
        name: "_causeAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_causePercentage",
        type: "uint256",
      },
    ],
    name: "registerSyndicate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_factory",
        type: "address",
      },
    ],
    name: "setFactory",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "syndicateAddresses",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "syndicates",
    outputs: [
      {
        internalType: "address",
        name: "treasuryAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "cause",
        type: "string",
      },
      {
        internalType: "address",
        name: "causeAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "causePercentage",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "createdAt",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "active",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "lensProfileId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_treasuryAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_cause",
        type: "string",
      },
      {
        internalType: "address",
        name: "_causeAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_causePercentage",
        type: "uint256",
      },
    ],
    name: "updateSyndicate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
