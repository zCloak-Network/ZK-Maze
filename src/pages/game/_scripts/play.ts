import { CellSize } from "../_utils";
import { StoreType, StoreDispatch } from "@/store";
import { Dispatch } from "react";

export default function (
  delta: number,
  gameState: StoreType,
  dispatch: Dispatch<StoreDispatch>
) {
  const { character, moveTarget, moving } = gameState;
  // console.log(character, moveTarget, moving);
  if (character && moveTarget && moving) {
    if (character.x + delta > moveTarget.x * CellSize) {
      character.x = moveTarget.x * CellSize;
      dispatch &&
        dispatch({
          type: "move.stop",
        });
    } else {
      character.x += delta;
    }
  }
}
