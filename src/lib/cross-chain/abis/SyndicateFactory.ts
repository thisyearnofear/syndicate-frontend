export const SyndicateFactoryABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_registry",
        type: "address",
      },
    ],
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
    name: "SyndicateCreated",
    type: "event",
  },
  {
    inputs: [
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
      {
        internalType: "address[]",
        name: "_owners",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "_threshold",
        type: "uint256",
      },
    ],
    name: "createSyndicate",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
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
    inputs: [],
    name: "registry",
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
        name: "_registry",
        type: "address",
      },
    ],
    name: "setRegistry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
