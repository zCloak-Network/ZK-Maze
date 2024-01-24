/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useState, useEffect } from "react";
import FileSaver from "file-saver";
import { generatePublicInput, gameState } from "../_utils";
import { PROGRAM_STRING, ABI, RESULT_MAP, RESULT_COLOR_MAP } from "@/constants";
import { Azeroth } from "../_utils";
import * as myWorker from "../_utils/zkpWorker.ts";
import { upload } from "@/api/zkp.ts";
import { useContractWrite } from "wagmi";
import { useStateStore } from "@/store";
import fetch from "isomorphic-fetch";
import { Actor, HttpAgent } from "@dfinity/agent";
const agent = new HttpAgent({ fetch });
const idlFactory = ({ IDL }) => {
  return IDL.Service({ greet: IDL.Func([IDL.Text], [IDL.Text], ["query"]) });
};
const canisterId = "7n7be-naaaa-aaaag-qc4xa-cai";
const actor = Actor.createActor(idlFactory, { agent, canisterId });

const ContractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;

export const GameOver = ({
  onRefresh,
  onExit,
}: {
  onRefresh: () => void;
  onExit: () => void;
}) => {
  const { path } = gameState;
  const [step, setStep] = useState(0);
  const [zkpResult, setZkpResult] = useState<string | undefined>();
  const [publicInput, setPublicInput] = useState<string | undefined>();
  const [zkpURL, setZkpURL] = useState<string | undefined>();
  const [programHash, setProgramHash] = useState<string | undefined>();
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const { gameResult } = useStateStore();

  const { writeAsync } = useContractWrite({
    address: ContractAddress,
    abi: ABI,
    functionName: "verifyECDSASignature",
    chainId: Azeroth.id,
  });

  const SettlementProgress = [
    {
      prefix: "$",
      content: "Game completed!",
      run: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 200);
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
          }, 0);
        });
      },
    },
    {
      prefix: ">",
      content: "1/4 Generate ZKP",
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
      prefix: ">",
      content: "2/4 ZK verification",
      class: "text-success",
      run: () => {
        return new Promise((resolve, reject) => {
          if (zkpResult) {
            actor
              .greet("hello world")
              .then((principal) => {
                console.log(resolve);
                resolve(true);
              })
              .catch(reject);

            // const file = new File(
            //   [zkpResult],
            //   `zkp-${new Date().getTime()}.json`,
            //   {
            //     type: "application/json",
            //   }
            // );
            // const formData = new FormData();
            // formData.append("file", file);
            // upload(formData)
            //   .then((res) => {
            //     if (res && res.data) {
            //       setZkpURL(res.data);
            //       resolve(true);
            //     } else {
            //       reject("upload error!");
            //     }
            //   })
            //   .catch(reject);
          }
        });
      },
    },
    {
      prefix: ">",
      content: "3/4 Sync to blockchain",
      class: "text-success",
      run: () => {
        return new Promise((resolve, reject) => {
          if (typeof writeAsync === "function") {
            // console.log("writeAsync:", programHash, publicInput, zkpURL);
            void writeAsync({
              args: [programHash, publicInput, zkpURL],
            })
              .then((res) => {
                console.log("writeAsync get", res);
                if (res.hash) {
                  setTransactionHash(res.hash);
                  onRefresh?.();
                  resolve(true);
                } else {
                  reject("contract fetch error");
                }
              })
              .catch(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                reject("contract send error");
              });
          } else {
            reject("contract init error");
          }
        });
      },
    },
    {
      prefix: ">",
      content: "4/4 Done!",
      class: "text-success",
      run: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 100);
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
                  `${Azeroth.blockExplorers.default.url}/tx/${transactionHash}`
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
