import { useWriteContract, useReadContract, useAccount } from "wagmi";

import { useEVMSBTAddress, useCurrentChain } from "../_utils";
import { useStateStore } from "@/store";
import { SBTABI } from "@/constants";
export default function useEvmSbt() {
  const Chain = useCurrentChain();
  const ContractAddress = useEVMSBTAddress();
  const { network } = useStateStore();

  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();

  const write = () => {
    return writeContractAsync({
      address: ContractAddress,
      abi: SBTABI,
      functionName: "claimToken",
      chainId: Chain?.id,
      args: [address],
    });
  };

  const {
    data: hasSBT,
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
    write,
  };
}
