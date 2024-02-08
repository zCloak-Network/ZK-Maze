/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BaseError, ContractFunctionRevertedError } from "viem";
import {
  useWaitForTransactionReceipt,
  useBalance,
  useBlockNumber,
  useAccount,
} from "wagmi";
import { useState, useEffect, useRef } from "react";
import FileSaver from "file-saver";
import { generatePublicInput, gameState } from "../_utils";
import {
  PROGRAM_STRING,
  ABI,
  RESULT_MAP,
  RESULT_COLOR_MAP,
  idlFactory,
} from "@/constants";
import { Chain } from "../_utils";
import * as myWorker from "../_utils/zkpWorker.ts";
import { useWriteContract } from "wagmi";
import { useStateStore } from "@/store";
import fetch from "isomorphic-fetch";
import { Actor, HttpAgent } from "@dfinity/agent";
import { useQueryClient } from "@tanstack/react-query";
// solana
import * as borsh from "borsh";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  SystemProgram,
  TransactionInstruction,
  Transaction,
} from "@solana/web3.js";
import useSolana from "../_utils/useSolana.ts";
const VerifyPayloadSchema: borsh.Schema = {
  struct: {
    program_hash: "string",
    public_hash: "string",
    output: { array: { type: "string" } },
    icp_signature: { array: { type: "u8" } },
  },
};

const agent = new HttpAgent({ fetch, host: "https://ic0.app" });

const canisterId = import.meta.env.VITE_APP_CANISTERID;
const actor = Actor.createActor(idlFactory, { agent, canisterId });

const ContractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;

export const GameOver = ({
  onRefresh,
  onExit,
}: {
  onRefresh: () => void;
  onExit: () => void;
}) => {
  const balanceData = useRef<bigint>(0n);
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data: balance, queryKey } = useBalance({
    address,
  });
  const queryClient = useQueryClient();
  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey });
  }, [blockNumber, queryClient, queryKey]);
  useEffect(() => {
    if (balance?.value) {
      balanceData.current = balance.value;
    }
  }, [balance]);

  const { path } = gameState;
  const [step, setStep] = useState(0);
  const [zkpResult, setZkpResult] = useState<string | undefined>();
  const [publicInput, setPublicInput] = useState<string | undefined>();
  const [programHash, setProgramHash] = useState<string | undefined>();
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const [signature, setSignature] = useState<string | undefined>();
  const [publicInputHash, setPublicInputHash] = useState<string | undefined>();
  const [outputVec, setOutputVec] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const { gameResult, network } = useStateStore();

  const { writeContractAsync } = useWriteContract();

  const contractResult = useWaitForTransactionReceipt({
    hash: transactionHash as `0x${string}`,
  });

  const userSelect = useRef<boolean>();

  const hiddenStepIndex = useRef<number[]>([]);

  // solana
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { PROGRAM_ID, SEED, verifyingAccount, hasPlayed, getBalance } =
    useSolana();
  const [solanaContractSuccess, setSolanaContractSuccess] = useState(false);

  useEffect(() => {
    if (
      network === "arbitrum-sepolia" &&
      contractResult?.status === "success"
    ) {
      console.log("onRefresh contractResult", contractResult);
      onRefresh?.();
    } else if (network === "solana" && solanaContractSuccess) {
      onRefresh?.();
    }
  }, [contractResult, onRefresh, solanaContractSuccess, network]);

  const SettlementProgress = [
    {
      prefix: "$",
      content: ["Game completed!"],
      run: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 100);
        });
      },
    },
    {
      prefix: ">",
      content: ["Settlement in progress..."],
      class: "text-warning",
      run: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 100);
        });
      },
    },
    {
      prefix: ">",
      content: ["Generate Zero Knowledge Proof locally"],
      class: "text-success",
      run: () => {
        return new Promise((resolve, reject) => {
          const { StartPosition, ExitPosition, ShortestPathLength, Map } =
            gameState;
          console.log(
            "generate zkp",
            StartPosition,
            ExitPosition,
            ShortestPathLength
          );
          const publicInput = generatePublicInput(
            Map,
            StartPosition,
            ExitPosition,
            ShortestPathLength
          );
          const secretInput = path
            .map((item) => [item.x, item.y])
            .flat()
            .join(",");
          setPublicInput(publicInput);
          console.log("publicInput", publicInput, "secretInput", secretInput);
          myWorker.onmessage({
            data: [PROGRAM_STRING, publicInput, secretInput],
            postMessage: (e) => {
              const _zkpResult = e.data;
              if (_zkpResult && e.programHash) {
                setProgramHash(e.programHash);
                setZkpResult(_zkpResult);
                resolve(true);
              } else {
                reject("generate zkp fail!");
              }
            },
          });
        });
      },
    },
    {
      prefix: "$",
      hideLoading: true,
      content: [
        `Post game result to ${
          network === "solana" ? "Solana" : "Arbitrum Sepolia"
        }?`,
        <>
          {userSelect.current !== false && (
            <button
              className="rounded-none text-warning btn btn-xs btn-ghost"
              disabled={userSelect.current !== undefined}
              onClick={() => {
                userSelect.current === undefined && (userSelect.current = true);
              }}
            >
              [Yes]
            </button>
          )}
          {userSelect.current !== true && (
            <button
              className="rounded-none text-warning btn btn-xs btn-ghost"
              disabled={userSelect.current !== undefined}
              onClick={() => {
                userSelect.current === undefined &&
                  (userSelect.current = false);
              }}
            >
              [No]
            </button>
          )}
        </>,
      ],
      class: "",
      run: () => {
        return new Promise((resolve, reject) => {
          const timer = setInterval(() => {
            if (userSelect.current === true) {
              clearInterval(timer);
              resolve(true);
            } else if (userSelect.current === false) {
              clearInterval(timer);
              reject(`User Cancel!`);
            }
          }, 200);
        });
      },
    },
    {
      prefix: "$",
      content: [
        network === "arbitrum-sepolia"
          ? "Minimum 0.002 ETH required."
          : "Minimum 0.00003 SOL required.",
        network === "arbitrum-sepolia" ? (
          <>
            <button
              className="rounded-none text-warning btn btn-xs btn-ghost"
              onClick={() => {
                window.open("https://arbitrum-faucet.com/");
              }}
            >
              [Faucet by Alchemy]
            </button>
            <button
              className="rounded-none text-warning btn btn-xs btn-ghost"
              onClick={() => {
                window.open("https://faucet.quicknode.com/arbitrum/sepolia/");
              }}
            >
              [Faucet by QuickNode]
            </button>
          </>
        ) : (
          <>
            <button
              className="rounded-none text-warning btn btn-xs btn-ghost"
              onClick={() => {
                window.open("https://faucet.solana.com/");
              }}
            >
              [Faucet by Solana]
            </button>
          </>
        ),
      ],
      class: "text-error",
      run: () => {
        return new Promise((resolve) => {
          if (network === "solana") {
            const timer = setInterval(() => {
              void getBalance().then((balanceData) => {
                console.log("balance=", balanceData);
                if (typeof balanceData === "number" && balanceData > 30000) {
                  hiddenStepIndex.current = [4];
                  clearInterval(timer);
                  resolve(true);
                }
              });
            }, 1500);
          } else {
            const timer = setInterval(() => {
              console.log("balance=", balanceData.current);
              if (balanceData.current > 2000000000000000n) {
                hiddenStepIndex.current = [4];
                clearInterval(timer);
                resolve(true);
              }
            }, 1500);
          }
        });
      },
    },
    {
      prefix: ">",
      content: ["Verify proof on the Internet Computer"],
      class: "text-success",
      run: () => {
        return new Promise((resolve, reject) => {
          if (zkpResult) {
            console.log("2/4:", programHash, publicInput, zkpResult);
            actor
              .zk_verify(programHash, publicInput, zkpResult)
              .then((res) => {
                console.log(res);
                if (Array.isArray(res) && res.length === 3) {
                  const [canister_Signature, publicInputHash, outputVec] = res;
                  setSignature(canister_Signature);
                  setPublicInputHash(publicInputHash);
                  setOutputVec(outputVec);
                  resolve(true);
                } else {
                  reject(false);
                }
              })
              .catch(reject);
          }
        });
      },
    },
    {
      prefix: ">",
      content: [
        `Post verification to ${
          network === "solana" ? "Solana" : "Arbitrum Sepolia"
        }`,
      ],
      class: "text-success",
      run: () => {
        return new Promise((resolve, reject) => {
          console.log(
            "3/4:",
            `0x${signature}`,
            programHash,
            publicInputHash,
            outputVec
          );
          if (network === "arbitrum-sepolia") {
            try {
              void writeContractAsync({
                address: ContractAddress,
                abi: ABI,
                functionName: "verifyECDSASignature",
                chainId: Chain.id,
                args: [
                  `0x${signature}`,
                  programHash,
                  publicInputHash,
                  outputVec,
                ],
              })
                .then((hash) => {
                  console.log("writeContractAsync get", hash);
                  if (hash) {
                    setTransactionHash(hash);

                    resolve(true);
                  } else {
                    reject("contract fetch error");
                  }
                })
                .catch(() => {
                  reject("contract send error");
                });
            } catch (err) {
              if (err instanceof BaseError) {
                const revertError = err.walk(
                  (err) => err instanceof ContractFunctionRevertedError
                );
                if (revertError instanceof ContractFunctionRevertedError) {
                  const errorName = revertError.data?.errorName ?? "";
                  console.log(errorName);
                }
              }
            }
          } else if (network === "solana") {
            try {
              if (!publicKey) throw new Error("Wallet not connected!");
              const mint = {
                program_hash: programHash,
                public_hash: publicInputHash,
                output: outputVec,
                icp_signature: Buffer.from(`${signature}`, "hex"),
              };

              return connection
                .getLatestBlockhashAndContext()
                .then((res) => {
                  const {
                    context: { slot: minContextSlot },
                    value: { blockhash, lastValidBlockHeight },
                  } = res;
                  const data = Buffer.from(
                    borsh.serialize(VerifyPayloadSchema, mint)
                  );

                  console.log("solana transaction", mint);

                  const VERIFY_SIZE = 1;
                  return connection
                    .getMinimumBalanceForRentExemption(VERIFY_SIZE)
                    .then((lamports) => {
                      if (!verifyingAccount) {
                        return reject("without verifyingAccount");
                      }

                      const transaction = new Transaction({
                        recentBlockhash: blockhash,
                      });

                      console.log("solana has played", hasPlayed);

                      if (!hasPlayed) {
                        transaction.add(
                          SystemProgram.createAccountWithSeed({
                            fromPubkey: publicKey,
                            basePubkey: publicKey,
                            seed: SEED,
                            newAccountPubkey: verifyingAccount,
                            lamports,
                            space: VERIFY_SIZE,
                            programId: PROGRAM_ID,
                          })
                        );
                      }

                      transaction.add(
                        new TransactionInstruction({
                          data,
                          keys: [
                            {
                              pubkey: verifyingAccount,
                              isSigner: false,
                              isWritable: true,
                            },
                          ],
                          programId: PROGRAM_ID,
                        })
                      );

                      return sendTransaction(transaction, connection, {
                        minContextSlot,
                      }).then((signature) => {
                        console.log("info", "Transaction sent:", signature);

                        setTransactionHash(signature);

                        return connection
                          .confirmTransaction({
                            blockhash,
                            lastValidBlockHeight,
                            signature,
                          })
                          .then(() => {
                            console.log(
                              "success",
                              "Transaction successful!",
                              signature
                            );
                            setSolanaContractSuccess(true);
                            resolve(true);
                          });
                      });
                    })
                    .catch(() => {
                      reject("Solana Transaction failed!");
                    });
                })
                .catch(() => {
                  reject("Solana Transaction failed!");
                });

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
              console.warn(
                "solana program error",
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                `Transaction failed! ${error?.message}`,
                signature
              );
              reject(`Solana Transaction failed! `);
            }
          }
        });
      },
    },
    {
      prefix: ">",
      content: ["Determine achievement on-chain"],
      class: "text-success",
      run: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 1000);
        });
      },
    },
  ];

  const SettlementOver = step >= SettlementProgress.length;

  useEffect(() => {
    if (!SettlementOver) {
      void SettlementProgress[step]
        .run?.()
        .then((res) => {
          if (res) {
            setStep(step + 1);
          }
        })
        .catch((err) => {
          setErrorMsg(err);
        });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="flex flex-col h-full text-white w-full p-4 top-0 left-0 absolute justify-center items-center">
      <div className="bg-base-100 text-base-content min-h-20 mockup-code">
        {SettlementProgress.slice(0, step + 1).map((log, index) => {
          return hiddenStepIndex.current.includes(index) ? null : (
            <pre
              data-prefix={log.prefix}
              className={errorMsg && step === index ? " text-error" : log.class}
              key={index}
            >
              {step === index && !errorMsg && !log.hideLoading && (
                <span className="loading loading-ball loading-xs"></span>
              )}
              {log.content.map((cont, index) => (
                <code
                  key={index}
                  style={
                    index > 0
                      ? {
                          display: "block",
                          paddingLeft: "40px",
                        }
                      : {}
                  }
                >
                  {cont}
                </code>
              ))}
            </pre>
          );
        })}

        {SettlementOver && (
          <pre
            data-prefix=">"
            className={`bg-${RESULT_COLOR_MAP[gameResult]} text-${RESULT_COLOR_MAP[gameResult]}-content`}
          >
            <code>Game Result: {RESULT_MAP[gameResult]}!</code>
          </pre>
        )}

        <div className="mt-4 text-center w-full px-4">
          {zkpResult && (
            <button
              className="rounded-none text-success btn btn-xs btn-ghost"
              onClick={() => {
                const blob = new Blob([zkpResult], {
                  type: "application/json;charset=utf-8",
                });
                FileSaver.saveAs(blob, `zkp-${new Date().getTime()}.json`);
              }}
            >
              [Save ZKP]
            </button>
          )}
          {transactionHash && (
            <button
              className="rounded-none text-success btn btn-xs btn-ghost"
              onClick={() =>
                window.open(
                  network === "arbitrum-sepolia"
                    ? `${Chain.blockExplorers.default.url}/tx/${transactionHash}`
                    : `https://solscan.io/tx/${transactionHash}?cluster=devnet`
                )
              }
            >
              [Browse Transaction]
            </button>
          )}
          {(SettlementOver || errorMsg) && (
            <button
              className="rounded-none text-error btn btn-xs btn-ghost"
              onClick={() => {
                setErrorMsg(undefined);
                onExit();
              }}
            >
              [Exit]
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
