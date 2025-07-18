"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { ThreeApp } from "./Fps/ThreeApp";
import * as CANNON from "cannon-es";
import { Gun } from "./Fps/Gun";
import Crosshair from "./Fps/Crosshair";
import { PlayerController } from "./Fps/PlayerController";
import { Wall } from "./Fps/Wall";
import { GameMap } from "./Fps/Map";
import { Lighting } from "./Fps/Lighting";
import { BotEnemy } from "./Fps/BotEnemy";

const gunPath = "/assets/pistol.glb";

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const slipperyMat = new CANNON.Material("slippery");
    const contactMat = new CANNON.ContactMaterial(slipperyMat, slipperyMat, {
      friction: 0,
      restitution: 0, // không nảy lại
    });
    const canvas = canvasRef.current!;
    const app = new ThreeApp(canvas);
    const player = new PlayerController(slipperyMat);
    const world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0),
    });
    world.addContactMaterial(contactMat);
    player.addToScene(app.scene, world);
    const bots: BotEnemy[] = [];
    const bot = new BotEnemy(
      new CANNON.Vec3(5, 1, -15),
      app.scene,
      world,
      slipperyMat
    );
    bots.push(bot);
    const gun = new Gun(app.scene, player.camera, bots);
    gun.load(gunPath);

    // Light
    new Lighting(app.scene, false);

    new GameMap(app.scene, world);

    // Walls
    new Wall(
      new CANNON.Vec3(1, 2, 5), // size
      new CANNON.Vec3(-3, 0, -10), // position
      0x8888ff, // color
      app.scene,
      world,
      slipperyMat
    );
    new Wall(
      new CANNON.Vec3(0.5, 2, 2.5),
      new CANNON.Vec3(3, 0, -10),
      0xff8888,
      app.scene,
      world,
      slipperyMat
    );

    // Mouse
    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement === canvas) {
        player.updateMouseLook(e.movementX, e.movementY);
      }
    });

    document.addEventListener("mousedown", (e) => {
      if (document.pointerLockElement === canvas && e.button === 0) {
        gun.startShooting();
      }
    });

    document.addEventListener("mouseup", (e) => {
      if (e.button === 0) gun.stopShooting();
    });

    canvas.addEventListener("click", () => {
      canvas.requestPointerLock();
    });

    const fixedTimeStep = 1 / 60;
    const maxSubSteps = 3;
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      world.step(fixedTimeStep, delta, maxSubSteps);
      player.update();
      bots.forEach((b) => b.update());
      app.render(player.camera);
    };
    animate();
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="w-screen h-screen block" />
      <Crosshair />
    </>
  );
}
