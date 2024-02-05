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
import type { TransactionSignature } from "@solana/web3.js";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
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
  const [transactionHash, setTransactionHash] = useState<
    `0x${string}` | undefined
  >();
  const [signature, setSignature] = useState<string | undefined>();
  const [publicInputHash, setPublicInputHash] = useState<string | undefined>();
  const [outputVec, setOutputVec] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const { gameResult, network } = useStateStore();

  const { writeContractAsync } = useWriteContract();

  const contractResult = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  useEffect(() => {
    if (contractResult?.status === "success") {
      console.log("onRefresh contractResult", contractResult);
      onRefresh?.();
    }
  }, [contractResult, onRefresh]);

  const userSelect = useRef<boolean>();

  const hiddenStepIndex = useRef<number[]>([]);

  // solana
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

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
        `Post game result to ${network}?`,
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
        "Minimum 0.002 ETH required.",
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
        </>,
      ],
      class: "text-error",
      run: () => {
        return new Promise((resolve) => {
          if (network === "solana") {
            hiddenStepIndex.current = [4];
            resolve(true);
          } else {
            const timer = setInterval(() => {
              console.log("balance=", balanceData.current);
              if (balanceData.current > 2000000000000000n) {
                hiddenStepIndex.current = [4];
                clearInterval(timer);
                resolve(true);
              }
            }, 1000);
          }
        });
      },
    },
    {
      prefix: ">",
      content: ["Verify proof on a decentralized network"],
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
      content: [`Post verification to ${network}`],
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
            let signature: TransactionSignature | undefined = undefined;
            try {
              if (!publicKey) throw new Error("Wallet not connected!");
              const mint = {
                program_hash: programHash,
                public_hash: publicInputHash,
                output: outputVec,
                icp_signature: new Uint8Array([
                  0xd9, 0xb4, 0x62, 0x7e, 0xb5, 0x13, 0x11, 0xcd, 0x07, 0x21,
                  0x8b, 0x70, 0x2c, 0x35, 0x1d, 0x0d, 0xbd, 0xe9, 0x95, 0x40,
                  0x57, 0x00, 0x20, 0x26, 0x73, 0xbe, 0x9c, 0x20, 0x44, 0x41,
                  0xbb, 0xbd, 0x53, 0x7a, 0x94, 0x44, 0x5e, 0xff, 0xda, 0xe3,
                  0xd1, 0xcb, 0x75, 0x38, 0xd9, 0xc1, 0xba, 0xd5, 0xd7, 0x8d,
                  0x97, 0x40, 0x92, 0x58, 0x67, 0x38, 0x6b, 0x4e, 0xf3, 0x5e,
                  0x6f, 0xd2, 0x9c, 0xe1,
                ]),
              };

              void connection.getLatestBlockhashAndContext().then((res) => {
                const {
                  context: { slot: minContextSlot },
                  value: { blockhash, lastValidBlockHeight },
                } = res;
                const data = Buffer.from(
                  borsh.serialize(VerifyPayloadSchema, mint)
                );

                console.log("solana transaction", mint);
                const transaction = new Transaction({
                  feePayer: publicKey,
                  recentBlockhash: blockhash,
                }).add(
                  new TransactionInstruction({
                    data,
                    keys: [
                      {
                        pubkey: publicKey,
                        isSigner: false,
                        isWritable: true,
                      },
                    ],
                    programId: new PublicKey(
                      "EfMghMxfMJUBh51G3u4JJGB2v1wFCHYCsBFo8Lz8QhJW"
                    ),
                  })
                );

                signature = void sendTransaction(transaction, connection, {
                  minContextSlot,
                }).then((signature) => {
                  console.log("info", "Transaction sent:", signature);

                  void connection
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
                      resolve(true);
                    });
                });
              });

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
              console.warn(
                "error",
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
                  `${Chain.blockExplorers.default.url}/tx/${transactionHash}`
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
