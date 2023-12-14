/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { useRef, useEffect, useState } from "react";
import { Application, Sprite, Assets, Container, TilingSprite } from "pixi.js";
// import { renderSpirit } from "./_scripts";
import * as keystrokes from "@rwh/keystrokes";
import { Keystrokes } from "@rwh/keystrokes";
import {
  StageWidth,
  StageHeight,
  CellSize,
  Map,
  TypeTextureMap,
  StageWidthCells,
  StageHeightCells,
  TextureType,
  StartPosition,
  isOutOfBound,
  isCollideType,
} from "../_utils";
// import play from "../_scripts/play";
import { GameOver } from "./GameOver";
import { gameState, dispatch } from "../_utils";
import { Header } from "./Header";

export const Game = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const app = new Application({ width: StageWidth, height: StageHeight });
  const { bindKey } = keystrokes as unknown as Keystrokes;
  const [gameIsOver, setGameOver] = useState(false);

  useEffect(() => {
    wrapRef.current?.appendChild(app.view as HTMLCanvasElement);

    void Assets.load("/spritesheet.json").then((sheet) => {
      const gameScene = new Container();
      app.stage.addChild(gameScene);

      // map
      const land = new TilingSprite(
        sheet.textures[TypeTextureMap[0]],
        StageWidth,
        StageHeight
      );
      gameScene.addChild(land);
      const container = new Container();
      gameScene.addChild(container);

      for (let i = 0; i < StageHeightCells; i++) {
        for (let j = 0; j < StageWidthCells; j++) {
          if (Map[i][j] > 0) {
            const TextureName = TypeTextureMap[Map[i][j]];
            const Texture = sheet.textures[TextureName];
            const sprite = new Sprite(Texture);
            sprite.width = CellSize;
            sprite.height = CellSize;
            sprite.x = j * CellSize;
            sprite.y = i * CellSize;
            container.addChild(sprite);
          }
        }
      }
      // character
      const TextureRight = sheet.textures["tile_0026.png"];
      const TextureDown = sheet.textures["tile_0024.png"];
      const TextureLeft = sheet.textures["tile_0023.png"];
      const TextureUp = sheet.textures["tile_0025.png"];

      const _character = new Sprite(TextureRight);
      _character.width = CellSize;
      _character.height = CellSize;
      _character.x = StartPosition.x * CellSize;
      _character.y = StartPosition.y * CellSize;
      gameScene.addChild(_character);

      dispatch &&
        dispatch({
          type: "init",
          param: {
            character: _character,
            path: [StartPosition],
          },
        });

      // events
      bindKey("ArrowUp", () => {
        if (gameIsOver || gameState.moving) return;
        dispatch && dispatch({ type: "move.up" });
      });
      bindKey("ArrowRight", () => {
        if (gameIsOver || gameState.moving) return;
        dispatch && dispatch({ type: "move.right" });
      });
      bindKey("ArrowDown", () => {
        if (gameIsOver || gameState.moving) return;
        dispatch && dispatch({ type: "move.down" });
      });
      bindKey("ArrowLeft", () => {
        if (gameIsOver || gameState.moving) return;
        dispatch && dispatch({ type: "move.left" });
      });

      //Start the game loop
      app.ticker.add(gameLoop);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gameSpeed = 2;
  const gameLoop = (delta: number) => {
    const { character, moveTarget, moving, gameOver } = gameState;
    if (character && moveTarget && moving) {
      if (isOutOfBound(moveTarget)) {
        return null;
      }
      const result: TextureType = isCollideType(moveTarget);
      const xDirection = moveTarget.x - character.x / CellSize >= 0 ? 1 : -1;
      const yDirection = moveTarget.y - character.y / CellSize >= 0 ? 1 : -1;
      const moveDone =
        character.x === moveTarget.x * CellSize &&
        character.y === moveTarget.y * CellSize;
      console.log(result, moveTarget);
      if (result === 0 || result === 3) {
        if (
          (xDirection === 1 && character.x + delta > moveTarget.x * CellSize) ||
          (xDirection === -1 && character.x - delta < moveTarget.x * CellSize)
        ) {
          character.x = moveTarget.x * CellSize;
          moveDone &&
            dispatch &&
            dispatch({
              type: "move.stop",
            });
        } else {
          character.x += delta * gameSpeed * xDirection;
        }

        if (
          (yDirection === 1 && character.y + delta > moveTarget.y * CellSize) ||
          (yDirection === -1 && character.y - delta < moveTarget.y * CellSize)
        ) {
          character.y = moveTarget.y * CellSize;
          moveDone &&
            dispatch &&
            dispatch({
              type: "move.stop",
            });
        } else {
          character.y += delta * gameSpeed * yDirection;
        }
      } else {
        dispatch && dispatch({ type: "move.cancel" });
      }
    }

    gameOver && setGameOver(true);
  };

  const reStartGame = () => {
    if (gameState.character) {
      gameState.character.x = StartPosition.x * CellSize;
      gameState.character.y = StartPosition.y * CellSize;
    }

    setGameOver(false);

    dispatch &&
      dispatch({
        type: "reset",
      });
  };

  return (
    <div>
      <Header />

      <div className=" my-8 wrap">
        <div
          ref={wrapRef}
          className="mx-auto relative overflow-hidden"
          style={{
            width: `${StageWidth}px`,
            height: `${StageHeight}px`,
          }}
        >
          {gameIsOver && <GameOver onExit={reStartGame} />}
        </div>
      </div>
    </div>
  );
};
