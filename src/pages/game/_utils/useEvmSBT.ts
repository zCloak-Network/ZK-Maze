import { useWriteContract, useReadContract, useAccount } from "wagmi";

import { useEVMSBTAddress, useCurrentChain } from ".";
import { useStateStore } from "@/store";
import { SBTABI } from "@/constants";

import { useState } from "react";
export function useEvmSbt() {
  const Chain = useCurrentChain();
  const ContractAddress = useEVMSBTAddress();
  const { network } = useStateStore();

  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();

  const [mintLoading, setClaimLoading] = useState(false);

  const mint = () => {
    setClaimLoading(true);
    return writeContractAsync({
      address: ContractAddress,
      abi: SBTABI,
      functionName: "mint",
      chainId: Chain?.id,
      args: [address],
    }).finally(() => setClaimLoading(false));
  };

  const {
    data: hasSBT,
    refetch: refetchSBT,
    // isPending: isContractLoading,
  } = useReadContract({
    address: ContractAddress,
    abi: SBTABI,
    functionName: "checkTokenID",
    args: [address],
    query: {
      enabled: network !== "solana",
    },
  });

  return {
    hasSBT,
    refetchSBT,
    mint,
    mintLoading,
  };
}
