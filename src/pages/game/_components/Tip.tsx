export const Tip = () => {
  return (
    <>
      <div className="fixed left-4 bottom-4">
        <div className="flex justify-center w-full">
          <kbd className="kbd">W</kbd>
        </div>
        <div className="flex justify-center gap-12 w-full">
          <kbd className="kbd">A</kbd>
          <kbd className="kbd">D</kbd>
        </div>
        <div className="flex justify-center w-full">
          <kbd className="kbd">S</kbd>
        </div>
      </div>

      {/* <div className="fixed right-4 bottom-4">
        <div className="flex justify-center w-full">
          <kbd className="kbd">▲</kbd>
        </div>
        <div className="flex justify-center gap-12 w-full">
          <kbd className="kbd">◀︎</kbd>
          <kbd className="kbd">▶︎</kbd>
        </div>
        <div className="flex justify-center w-full">
          <kbd className="kbd">▼</kbd>
        </div>
      </div> */}
    </>
  );
};
