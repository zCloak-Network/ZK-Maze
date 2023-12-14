import { useState, useEffect } from "react";
import {
  StageWidthCells,
  StageHeightCells,
  StartPosition,
  ExitPosition,
  ShortestPathLength,
  filterMapPoint,
  Map,
} from "../_utils";
import { gameState } from "../_utils";

export const GameOver = ({ onExit }: { onExit: () => void }) => {
  const { path } = gameState;
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
      content: "1/4 Generate ZKP",
      class: "text-success",
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
      content: "2/4 Upload ZKP",
      class: "text-success",
      run: () => {
        return new Promise((resolve) => {
          console.log(GameInfo);
          setTimeout(() => {
            setZkpHash("131313121");
            resolve(true);
          }, 100);
        });
      },
    },
    {
      prefix: ">",
      content: "3/4 ZK verification",
      class: "text-success",
      run: () => {
        return new Promise((resolve) => {
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
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<boolean | undefined>();
  const [zkpHash, setZkpHash] = useState<string | undefined>();
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const SettlementOver = step >= SettlementProgress.length;
  const GameInfo = {
    StageWidthCells,
    StageHeightCells,
    StartPosition,
    ExitPosition,
    ShortestPathLength,
    ObstacleArray: filterMapPoint(Map, (item) => item !== 0 && item !== 3),
    path,
  };

  useEffect(() => {
    console.log(SettlementOver, step);
    if (!SettlementOver) {
      void SettlementProgress[step].run?.().then((res) => {
        if (res) {
          setStep(step + 1);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="flex flex-col h-full bg-[rgba(0,0,0,.3)] text-white w-full p-4 top-0 left-0 absolute justify-center items-center">
      <div className="bg-base-100 text-base-content min-h-20 mockup-code">
        {SettlementProgress.slice(0, step + 1).map((log, index) => (
          <pre data-prefix={log.prefix} className={log.class} key={index}>
            {step === index && (
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
          {zkpHash && (
            <button className="rounded-none text-success btn btn-xs btn-ghost">
              [Browse ZKP]
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
