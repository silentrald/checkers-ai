import * as PIXI from '../modules/pixi.min.mjs';
import Input from './input.js';

const TILE_SIZE = 64;

const app = new PIXI.Application({
  width: TILE_SIZE * 8,
  height: TILE_SIZE * 8,
});
document.body.appendChild(app.view);

const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

// Classes
const input = new Input(graphics);

// Input
graphics.interactive = true;
graphics.on('mousedown', (ev) => {
  input.mousedown(ev);
});
