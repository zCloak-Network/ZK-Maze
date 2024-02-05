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
  const { gameResult } = useStateStore();

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
        "Post game result to Arbitrum Sepolia?",
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
          const timer = setInterval(() => {
            console.log("balance=", balanceData.current);
            if (balanceData.current > 2000000000000000n) {
              hiddenStepIndex.current = [4];
              clearInterval(timer);
              resolve(true);
            }
          }, 1000);
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
      content: ["Post verification to Arbitrum Sepolia"],
      class: "text-success",
      run: () => {
        return new Promise((resolve, reject) => {
          if (typeof writeContractAsync === "function") {
            console.log(
              "3/4:",
              `0x${signature}`,
              programHash,
              publicInputHash,
              outputVec
            );
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
          } else {
            reject("contract init error");
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
