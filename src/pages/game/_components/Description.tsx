/* eslint-disable react/no-unescaped-entities */
export const Description = () => {
  return (
    <div className="fixed right-4 bottom-4 ">
      <div className="collapse bg-base-200 shadow-lg">
        <input type="checkbox" className="peer" />
        <div className="collapse-title bg-primary text-primary-content peer-checked:bg-white peer-checked:text-secondary-content">
          <h2 className="text-lg font-bold ">How to play?</h2>
        </div>
        <div className="collapse-content bg-primary text-primary-content peer-checked:bg-white peer-checked:text-secondary-content">
          <div className=" p-4 border-t border-base-300 w-[280px] text-sm">
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
    </div>
  );
};
