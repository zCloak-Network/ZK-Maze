/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BaseError, ContractFunctionRevertedError } from "viem";
import {
  useWaitForTransactionReceipt,
  useBalance,
  useBlockNumber,
  useAccount,
} from "wagmi";
import { useState, useEffect } from "react";
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
{
  /* 2000000000000000n */
}
/**
 * <button
                className="btn btn-sm btn-success btn-outline"
                onClick={() => {
                  window.open("https://arbitrum-faucet.com/");
                }}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M9.16488 17.6505C8.92513 17.8743 8.73958 18.0241 8.54996 18.1336C7.62175 18.6695 6.47816 18.6695 5.54996 18.1336C5.20791 17.9361 4.87912 17.6073 4.22153 16.9498C3.56394 16.2922 3.23514 15.9634 3.03767 15.6213C2.50177 14.6931 2.50177 13.5495 3.03767 12.6213C3.23514 12.2793 3.56394 11.9505 4.22153 11.2929L7.04996 8.46448C7.70755 7.80689 8.03634 7.47809 8.37838 7.28062C9.30659 6.74472 10.4502 6.74472 11.3784 7.28061C11.7204 7.47809 12.0492 7.80689 12.7068 8.46448C13.3644 9.12207 13.6932 9.45086 13.8907 9.7929C14.4266 10.7211 14.4266 11.8647 13.8907 12.7929C13.7812 12.9825 13.6314 13.1681 13.4075 13.4078M10.5919 10.5922C10.368 10.8319 10.2182 11.0175 10.1087 11.2071C9.57284 12.1353 9.57284 13.2789 10.1087 14.2071C10.3062 14.5492 10.635 14.878 11.2926 15.5355C11.9502 16.1931 12.279 16.5219 12.621 16.7194C13.5492 17.2553 14.6928 17.2553 15.621 16.7194C15.9631 16.5219 16.2919 16.1931 16.9495 15.5355L19.7779 12.7071C20.4355 12.0495 20.7643 11.7207 20.9617 11.3787C21.4976 10.4505 21.4976 9.30689 20.9617 8.37869C20.7643 8.03665 20.4355 7.70785 19.7779 7.05026C19.1203 6.39267 18.7915 6.06388 18.4495 5.8664C17.5212 5.3305 16.3777 5.3305 15.4495 5.8664C15.2598 5.97588 15.0743 6.12571 14.8345 6.34955"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Faucet by Alchemy
              </button>

              <button
                className="btn btn-sm btn-success btn-outline"
                onClick={() => {
                  window.open("https://faucet.quicknode.com/arbitrum/sepolia/");
                }}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M9.16488 17.6505C8.92513 17.8743 8.73958 18.0241 8.54996 18.1336C7.62175 18.6695 6.47816 18.6695 5.54996 18.1336C5.20791 17.9361 4.87912 17.6073 4.22153 16.9498C3.56394 16.2922 3.23514 15.9634 3.03767 15.6213C2.50177 14.6931 2.50177 13.5495 3.03767 12.6213C3.23514 12.2793 3.56394 11.9505 4.22153 11.2929L7.04996 8.46448C7.70755 7.80689 8.03634 7.47809 8.37838 7.28062C9.30659 6.74472 10.4502 6.74472 11.3784 7.28061C11.7204 7.47809 12.0492 7.80689 12.7068 8.46448C13.3644 9.12207 13.6932 9.45086 13.8907 9.7929C14.4266 10.7211 14.4266 11.8647 13.8907 12.7929C13.7812 12.9825 13.6314 13.1681 13.4075 13.4078M10.5919 10.5922C10.368 10.8319 10.2182 11.0175 10.1087 11.2071C9.57284 12.1353 9.57284 13.2789 10.1087 14.2071C10.3062 14.5492 10.635 14.878 11.2926 15.5355C11.9502 16.1931 12.279 16.5219 12.621 16.7194C13.5492 17.2553 14.6928 17.2553 15.621 16.7194C15.9631 16.5219 16.2919 16.1931 16.9495 15.5355L19.7779 12.7071C20.4355 12.0495 20.7643 11.7207 20.9617 11.3787C21.4976 10.4505 21.4976 9.30689 20.9617 8.37869C20.7643 8.03665 20.4355 7.70785 19.7779 7.05026C19.1203 6.39267 18.7915 6.06388 18.4495 5.8664C17.5212 5.3305 16.3777 5.3305 15.4495 5.8664C15.2598 5.97588 15.0743 6.12571 14.8345 6.34955"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Faucet by QuickNode
              </button>
 * **/
export const GameOver = ({
  onRefresh,
  onExit,
}: {
  onRefresh: () => void;
  onExit: () => void;
}) => {
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data: balanceData, queryKey } = useBalance({
    address,
  });
  const queryClient = useQueryClient();
  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey });
  }, [blockNumber, queryClient, queryKey]);

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

  const SettlementProgress = [
    {
      prefix: "$",
      content: "Game completed!",
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
      content: "Settlement in progress...",
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
      content: "Generate Zero Knowledge Proof locally",
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
      content: (
        <>
          Go next?
          <button
            className="rounded-none text-success btn btn-xs btn-ghost"
            onClick={() => {}}
          >
            [Yes]
          </button>
          <button
            className="rounded-none text-success btn btn-xs btn-ghost"
            onClick={() => {}}
          >
            [No]
          </button>
        </>
      ),
      class: "text-warning",
      run: () => {
        return new Promise((resolve) => resolve(true));
      },
    },
    {
      prefix: ">",
      content: "Verify proof on decentralized network",
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
      content: "Write verification on Arbitrum blockchain",
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
      content: "Determination of achievement on chain",
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
        {SettlementProgress.slice(0, step + 1).map((log, index) => (
          <pre
            data-prefix={log.prefix}
            className={errorMsg && step === index ? " text-error" : log.class}
            key={index}
          >
            {step === index && !errorMsg && (
              <span className="loading loading-ball loading-xs"></span>
            )}
            <code>{log.content}</code>
          </pre>
        ))}

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
