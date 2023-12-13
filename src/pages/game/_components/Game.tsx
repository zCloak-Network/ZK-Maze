import { useRef, useEffect, useState, useCallback } from "react";
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
  safeMove,
  StartPosition,
  ExitPosition,
  Step,
} from "../_utils";
import play from "../_scripts/play";
import { GameOver } from "./GameOver";

import { Header } from "./Header";

export const Game = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const app = new Application({ width: StageWidth, height: StageHeight });
  const { bindKey } = keystrokes as unknown as Keystrokes;
  const [gameIsOver, setGameOver] = useState(false);
  const [path, setPath] = useState<Step[]>([]);
  const [character, setCharacter] = useState<Sprite>();

  useEffect(() => {
    wrapRef.current?.appendChild(app.view as HTMLCanvasElement);

    Assets.load("/spritesheet.json").then((sheet) => {
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
      setCharacter(_character);
      // game logic
      const path: Step[] = [];
      const handleCollide = (
        result: TextureType | undefined,
        position: Step
      ) => {
        if (result === 0) {
          path.push({ x: position.x / CellSize, y: position.y / CellSize });
          return true;
        } else if (
          position.x / CellSize === ExitPosition.x &&
          position.y / CellSize === ExitPosition.y
        ) {
          // ExitPosition
          setGameOver(true);
          setPath([...path, { ...ExitPosition }]);
          path.length = 0;
          return true;
        } else {
          return false;
        }
      };
      // todo: AnimatedSprite() gotoAndPlay gotoAndStop
      // events
      bindKey("ArrowUp", () => {
        if (gameIsOver) return;
        _character.texture = TextureUp;
        safeMove(_character, "up", handleCollide);
      });
      bindKey("ArrowRight", () => {
        if (gameIsOver) return;
        _character.texture = TextureRight;
        safeMove(_character, "right", handleCollide);
      });
      bindKey("ArrowDown", () => {
        if (gameIsOver) return;
        _character.texture = TextureDown;
        safeMove(_character, "down", handleCollide);
      });
      bindKey("ArrowLeft", () => {
        if (gameIsOver) return;
        _character.texture = TextureLeft;
        safeMove(_character, "left", handleCollide);
      });
    });

    //Start the game loop
    const gameLoop = () => {
      character && play();
    };
    app.ticker.add(gameLoop);
  }, []);

  const reStartGame = useCallback(() => {
    setGameOver(false);
    setPath([]);
    if (character) {
      character.x = StartPosition.x * CellSize;
      character.y = StartPosition.y * CellSize;
    }
  }, [character]);

  return (
    <div>
      <Header />
      <div
        ref={wrapRef}
        className="mx-auto my-8 relative overflow-hidden"
        style={{
          width: `${StageWidth}px`,
          height: `${StageHeight}px`,
        }}
      >
        {gameIsOver && <GameOver path={path} onExit={reStartGame} />}
      </div>
    </div>
  );
};
