import { useState, useEffect } from "react";
import FileSaver from "file-saver";
import {
  StartPosition,
  ExitPosition,
  ShortestPathLength,
  Map,
  generatePublicInput,
} from "../_utils";
import { gameState } from "../_utils";
import { program } from "../_scripts/program";
import * as myWorker from "../_scripts/zkpWorker.ts";
import { upload } from "@/api/zkp.ts";

export const GameOver = ({ onExit }: { onExit: () => void }) => {
  const { path } = gameState;
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<boolean | undefined>();
  const [zkpResult, setZkpResult] = useState<string | undefined>();
  const [publicInput, setPublicInput] = useState<string | undefined>();
  const [zkpURL, setZkpURL] = useState<string | undefined>();
  const [programHash, setProgramHash] = useState<string | undefined>();
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | undefined>();

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
            data: [program, publicInput, secretInput],
            postMessage: (e: { data: any; programHash: string }) => {
              const _zkpResult = e.data;
              setProgramHash(e.programHash);
              if (_zkpResult) {
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
      content: "2/4 Upload ZKP",
      class: "text-success",
      run: () => {
        return new Promise((resolve, reject) => {
          if (zkpResult) {
            const file = new File(
              [zkpResult],
              `zkp-${new Date().getTime()}.json`,
              {
                type: "application/json",
              }
            );
            const formData = new FormData();
            formData.append("file", file);
            upload(formData)
              .then((res) => {
                if (res && res.data) {
                  setZkpURL(res.data);
                  resolve(true);
                } else {
                  reject("upload error!");
                }
              })
              .catch(reject);
          }
        });
      },
    },
    {
      prefix: ">",
      content: "3/4 ZK verification",
      class: "text-success",
      run: () => {
        return new Promise((resolve) => {
          console.log(programHash, publicInput, zkpURL);
          setTimeout(() => {
            setTransactionHash("sfsdfsfsfsfs");
            resolve(true);
          }, 1000);
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
            // todo
            console.log("get result");
            setResult(true);
            resolve(true);
          }, 100);
        });
      },
    },
  ];

  const SettlementOver = step >= SettlementProgress.length;

  useEffect(() => {
    console.log(SettlementOver, step);
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
    <div className="flex flex-col h-full bg-[rgba(0,0,0,.3)] text-white w-full p-4 top-0 left-0 absolute justify-center items-center">
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
        {result === true && (
          <pre data-prefix=">" className="bg-success text-success-content">
            <code>Game Pass!</code>
          </pre>
        )}
        {result === false && (
          <pre data-prefix=">" className="bg-warning text-warning-content">
            <code>Game Fail!</code>
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
            <button className="rounded-none text-success btn btn-xs btn-ghost">
              [Browse Transaction]
            </button>
          )}
          {SettlementOver && (
            <button
              className="rounded-none text-error btn btn-xs btn-ghost"
              onClick={onExit}
            >
              [Exit]
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
