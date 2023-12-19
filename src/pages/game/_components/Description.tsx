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
              1. Use the WASD keys or the arrow keys to control the movement of
              your character.
            </p>
            <p className="mb-2">
              2. If you find this path impressive, you can anonymize your route
              through the ZK method. We will use the ZK program to determine
              whether you qualify for the achievement.
            </p>
            <h2 className="font-bold mb-2">Achievement</h2>
            <p>
              "Efficiency First": Escape the maze by taking the shortest path.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
