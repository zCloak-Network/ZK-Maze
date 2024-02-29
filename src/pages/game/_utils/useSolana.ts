import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useState, useEffect, useCallback } from "react";
import { useStateStore } from "@/store";
export default function useSolana() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [verifyingAccount, setVerifyingAccount] = useState<PublicKey | null>(
    null
  );
  const { network } = useStateStore();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const PROGRAM_ID = new PublicKey(
    "EfMghMxfMJUBh51G3u4JJGB2v1wFCHYCsBFo8Lz8QhJW"
  );
  const SEED = "zCloak zkMaze Verify Program";

  useEffect(() => {
    if (publicKey) {
      void PublicKey.createWithSeed(publicKey, SEED, PROGRAM_ID).then(
        (res: PublicKey) => {
          setVerifyingAccount(res);
        }
      );
    }
  }, [PROGRAM_ID, publicKey]);

  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [data, setData] = useState<number | null>();
  const [hasPlayed, setPlayed] = useState(false);

  const refetch = useCallback(() => {
    if (network !== "solana") {
      return null;
    }
    if (isPending) {
      return null;
    }
    if (verifyingAccount) {
      setIsPending(true);
      void connection
        .getAccountInfo(verifyingAccount)
        .then((res) => {
          if (res) {
            console.log("solana get", res);
            if (res?.data[0] !== undefined) {
              setPlayed(true);
            }
            setData(res?.data[0]);
            setSuccess(true);
          } else {
            setData(null);
            setSuccess(false);
          }
        })
        .finally(() => {
          setIsPending(false);
        });
    } else {
      setData(null);
      setSuccess(false);
      console.warn("No verifying account");
    }
  }, [connection, isPending, network, verifyingAccount]);

  useEffect(() => {
    verifyingAccount && connection && refetch();
  }, [connection, refetch, verifyingAccount]);

  return {
    publicKey,
    PROGRAM_ID,
    SEED,
    verifyingAccount,
    refetch,
    data,
    isPending,
    isSuccess,
    hasPlayed,
    getBalance: () => {
      if (publicKey) {
        return connection.getBalance(publicKey);
      } else {
        return new Promise((_resolve, reject) => {
          reject("getBalance: No publicKey");
        });
      }
    },
  };
}
