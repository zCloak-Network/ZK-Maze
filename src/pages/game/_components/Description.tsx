/* eslint-disable react/no-unescaped-entities */
export const Description = () => {
  return (
    <div className="flex flex-col right-4 bottom-4 gap-2 fixed">
      <div className="bg-base-200 shadow-lg collapse">
        <input type="checkbox" className="peer" />
        <div className="bg-primary text-primary-content collapse-title peer-checked:bg-white peer-checked:text-secondary-content">
          <h2 className="font-bold text-lg ">How to play?</h2>
        </div>
        <div className="bg-primary text-primary-content collapse-content peer-checked:bg-white peer-checked:text-secondary-content">
          <div className=" border-t border-base-300 text-sm p-2 w-[240px]">
            <p className="mb-2">
              1. Control your character with W A S D or ⬆️ ⬇️ ⬅️ ➡️
            </p>
            <p className="mb-2">
              2. Showcase your impressive path anonymously using the ZK method.
              We'll verify your achievement eligibility with the ZK program.
            </p>
            <h2 className="font-bold mb-2">Achievement</h2>
            <p>“Maze Navigator" - Escaped the maze</p>
            <p>"Shortcut Genius" - Escaped the maze in the shortest path</p>
          </div>
        </div>
      </div>

      <div className="bg-base-200 shadow-lg collapse">
        <input type="checkbox" className="peer" />
        <div className="bg-primary text-primary-content collapse-title peer-checked:bg-white peer-checked:text-secondary-content">
          <h2 className="font-bold text-lg ">How it works?</h2>
        </div>
        <div className="bg-primary text-primary-content collapse-content peer-checked:bg-white peer-checked:text-secondary-content">
          <div className=" border-t border-base-300 text-sm p-2 w-[240px]">
            <p className="mb-2">
              By walking in the maze, you generate a zk-STARK proof locally in
              your browser. This proves you have found the exit without
              disclosing the path you chose. The proof is sent to our ICP
              canister for verification. The verification result is signed by
              the canister using threshold ECDSA, which is then sent to e.g. EVM
              and Solana chains for future operation.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-base-200 shadow-lg collapse">
        <input type="checkbox" className="peer" />
        <div className="bg-primary text-primary-content collapse-title peer-checked:bg-white peer-checked:text-secondary-content">
          <h2 className="font-bold text-lg ">Acknowledgement</h2>
        </div>
        <div className="bg-primary text-primary-content collapse-content peer-checked:bg-white peer-checked:text-secondary-content">
          <div className=" border-t border-base-300 text-sm p-2 w-[240px]">
            <p className="mb-2">
              We use Polygon Miden as our proof system in this game. Big thanks
              to the Polygon team!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
