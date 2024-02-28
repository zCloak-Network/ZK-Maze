import { Chain } from "wagmi/chains";

export const L3 = {
  id: 76297047005,
  name: "Azeroth",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://nitro.zkid.xyz/"] },
    default: { http: ["https://nitro.zkid.xyz/"] },
  },
  blockExplorers: {
    default: {
      name: "AzerothExplorer",
      url: "https://nitro-explorer.zkid.xyz",
    },
  },
} as const satisfies Chain;

export const L3Dev = {
  id: 76297047005,
  name: "Azeroth",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://nitro.zkid.xyz/"] },
    default: { http: ["https://nitro.zkid.xyz/"] },
  },
  blockExplorers: {
    default: {
      name: "AzerothExplorer",
      url: "https://nitro-explorer.zkid.xyz",
    },
  },
} as const satisfies Chain;

export const ContractAddressMap: Record<number, `0x${string}`> = {
  421614: "0xce68617D6575EDe95aF1eAaC7489b06F3b107D9f", //arbitrumSepolia
  11155420: "0x0483e88cd38cccb71c9c1020faf830d905542d09", //optimismSepolia
  84532: "0x0483e88cd38cccb71c9c1020faf830d905542d09", //baseSepolia
};

export const SBTAddressMap: Record<number, `0x${string}`> = {
  421614: "0xce68617D6575EDe95aF1eAaC7489b06F3b107D9f", //arbitrumSepolia
  11155420: "0x0483e88cd38cccb71c9c1020faf830d905542d09", //optimismSepolia
  84532: "0x0483e88cd38cccb71c9c1020faf830d905542d09", //baseSepolia
};

export const FaucetMap: Record<number, Record<string, string>[]> = {
  421614: [
    { "Faucet by Alchemy": "https://www.alchemy.com/faucets/arbitrum-sepolia" },
    { "Faucet by QuickNode": "https://faucet.quicknode.com/arbitrum/sepolia/" },
  ],
  11155420: [
    { "Faucet by Alchemy": "https://www.alchemy.com/faucets/optimism-sepolia" },
    { "Faucet by QuickNode": "https://faucet.quicknode.com/optimism/sepolia" },
  ],
  84532: [
    { "Faucet by Alchemy": "https://www.alchemy.com/faucets/base-sepolia" },
    { "Faucet by QuickNode": "https://faucet.quicknode.com/base/sepolia" },
  ],
};
