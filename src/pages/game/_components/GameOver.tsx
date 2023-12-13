import { Step } from "../_utils";

export const GameOver = ({
  path,
  onExit,
}: {
  path: Step[];
  onExit: () => void;
}) => {
  const handleSettlement = (path: Step[]) => {
    console.log("settlement", path);
  };

  handleSettlement(path);

  return (
    <div className="flex flex-col h-full bg-[rgba(0,0,0,.3)] text-white w-full p-4 top-0 left-0 absolute justify-center items-center">
      <div className="bg-base-100 text-base-content mockup-code">
        <pre data-prefix="$">
          <code>Game completed!</code>
        </pre>
        <pre data-prefix=">" className="text-warning">
          <code>Settlement in progress...</code>
        </pre>
        <pre data-prefix=">" className="text-success">
          <code>1/3 Generate ZKP</code>
        </pre>
        <pre data-prefix=">" className="text-success">
          <code>2/3 ZK verification</code>
        </pre>
        <pre data-prefix=">" className="text-success">
          <code>3/3 Done!</code>
        </pre>
        <pre data-prefix=">" className="bg-warning text-warning-content">
          <code>Congratulations!</code>
        </pre>

        <div className="mt-4 text-center w-full px-4">
          <button className="rounded-none text-success btn btn-sm btn-ghost">
            [TransactionHash]
          </button>
          <button
            className="rounded-none text-error btn btn-sm btn-ghost"
            onClick={onExit}
          >
            [Exit]
          </button>
        </div>
      </div>
    </div>
  );
};
