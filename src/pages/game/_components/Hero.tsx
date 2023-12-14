// import { ButtonEnable } from "@/components";
import { useWeb3Modal } from "@web3modal/wagmi/react";

export const Hero = () => {
  const { open } = useWeb3Modal();

  return (
    <div
      className="min-h-screen hero"
      style={{
        backgroundImage: "url(/nauris-amatnieks-forestbattlebackground.jpg)",
      }}
    >
      <div className="bg-opacity-60 hero-overlay"></div>
      <div className="text-center text-neutral-content hero-content">
        <div className="max-w-md">
          <h1 className="font-bold mb-5 text-5xl">ZK Maze</h1>
          <p className="mb-5">
            Find a path, navigate through various obstacles, and escape the
            maze. If you want to achieve success, you'll need to strategically
            plan your route and discover the shortest path to exit the maze. Are
            all you adventurers ready? Let's get started.
          </p>
          {/* <ButtonEnable /> */}
          <button className="btn btn-primary" onClick={() => void open()}>
            Connect Wallet to Play
          </button>
        </div>
      </div>
    </div>
  );
};
