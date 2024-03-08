import { useDispatchStore, useStateStore } from "@/store";
import IconBgm from "@/assets/music.svg?react";
import IconMuted from "@/assets/muted.svg?react";
import { useState } from "react";

export const BgmSwitch = () => {
  const { bgm } = useStateStore();
  const dispatch = useDispatchStore();
  const [bgmValue, setBgm] = useState<boolean>(bgm);

  const handleChange = () => {
    dispatch && dispatch({ type: "bgm", param: !bgmValue });
    setBgm(!bgmValue);
  };

  return (
    <div className="absolute right-4 top-4">
      <label
        className={`btn btn-sm btn-circle swap swap-rotate ${
          bgmValue ? " btn-primary" : ""
        }`}
      >
        {/* this hidden checkbox controls the state */}
        <input type="checkbox" checked={bgmValue} onChange={handleChange} />

        {/* volume on icon */}
        <IconBgm className="swap-on w-5 h-5" />

        {/* volume off icon */}
        <IconMuted className="swap-off w-5 h-5" />
      </label>
    </div>
  );
};
