import * as PIXI from 'pixi.js';
import Board from './board';
import Piece from './piece';
import Highlight from './highlight';
import Input from './input';
import AI from './ai';
import { Move } from './types';

import COLORS from '../config/colors';
import { OUTLINE_SIZE, TILE_SIZE } from '../config/values';
import STATES from '../config/states';
import DIRECTIONS from '../config/directions';

class Checkers {
  board: Board;
  input: Input;
  ai: AI;
  app = new PIXI.Application();
  graphics = new PIXI.Graphics();

  inputting = true;
  jumping = false;
  flipped = false;
  state = STATES.START;

  moveStack: Move[] = [];
  captureMove: Move | undefined;

  constructor(board: Board) {
    this.board = board;
    this.input = new Input(this);
    this.ai = new AI(this);

    this.setup();
  }

  setup() {
    // Resize the application window
    const size = TILE_SIZE * 8;
    this.app.renderer.resize(size, size);
    this.app.renderer.backgroundColor = COLORS.BEIGE;
    this.app.stage.addChild(this.graphics);

    // Setup the input system
    this.graphics.interactive = true;
    this.graphics.on('mousedown', (ev) => this.input.mousedown(ev));
    this.graphics.transform.position.set(TILE_SIZE * 4, TILE_SIZE * 4);
    this.graphics.transform.pivot.set(TILE_SIZE * 4, TILE_SIZE * 4);

    this.newGame();
  }

  newGame() {
    this.state = STATES.START;
    this.inputting = true;
    this.jumping = false;
    this.moveStack = [];

    this.ai.setup();

    // Setup the rotation
    this.flipped = this.board.flipped;
    this.graphics.transform.rotation = this.board.flipped ? Math.PI : 0;

    this.draw();

    if (this.board.playerTurn) {
      this.passToPlayer();
    } else {
      this.passToAi();
    }
  }

  flip() {
    this.flipped = !this.flipped;
    this.graphics.transform.rotation = this.flipped ? Math.PI : 0;
  }

  // Highlights
  resetHighlights() {
    for (const { position, } of this.board.highlights) {
      this.board.setCell(position, null);
    }
    this.board.highlights.splice(0);
  }

  addHighlight(position: number) {
    const highlight = new Highlight(position);
    this.board.highlights.push(highlight);
    this.board.setCell(position, highlight);
  }

  highlightPlayerMoves(piece: Piece) {
    if (!piece.player) return;

    this.board.selectedPiece = piece;
    this.resetHighlights();

    // Mandatory Jumps
    if (this.board.jumpPieces.length > 0) {
      if (piece.king) {
        if (this.board.isJumpable(piece.position, DIRECTIONS.BOTTOM_LEFT, false))
          this.addHighlight(this.board.getBottomLeftJump(piece.position));
        if (this.board.isJumpable(piece.position, DIRECTIONS.BOTTOM_RIGHT, false))
          this.addHighlight(this.board.getBottomRightJump(piece.position));
      }

      if (this.board.isJumpable(piece.position, DIRECTIONS.TOP_LEFT, false))
        this.addHighlight(this.board.getTopLeftJump(piece.position));
      if (this.board.isJumpable(piece.position, DIRECTIONS.TOP_RIGHT, false))
        this.addHighlight(this.board.getTopRightJump(piece.position));
    } else { // Normal Move
      if (piece.king) {
        if (this.board.isMovable(piece.position, DIRECTIONS.BOTTOM_LEFT))
          this.addHighlight(this.board.getBottomLeft(piece.position));
        if (this.board.isMovable(piece.position, DIRECTIONS.BOTTOM_RIGHT))
          this.addHighlight(this.board.getBottomRight(piece.position));
      }

      if (this.board.isMovable(piece.position, DIRECTIONS.TOP_LEFT))
        this.addHighlight(this.board.getTopLeft(piece.position));
      if (this.board.isMovable(piece.position, DIRECTIONS.TOP_RIGHT))
        this.addHighlight(this.board.getTopRight(piece.position));
    }

    this.draw();
  }

  highlightAdditionalJumps(piece: Piece) {
    if (piece.king && !this.board.isBottomEdge(piece.position)) {
      if (this.board.isJumpable(piece.position, DIRECTIONS.BOTTOM_LEFT, false))
        this.addHighlight(this.board.getBottomLeftJump(piece.position));
      if (this.board.isJumpable(piece.position, DIRECTIONS.BOTTOM_RIGHT, false))
        this.addHighlight(this.board.getBottomRightJump(piece.position));
    }

    if (this.board.isJumpable(piece.position, DIRECTIONS.TOP_LEFT, false))
      this.addHighlight(this.board.getTopLeftJump(piece.position));
    if (this.board.isJumpable(piece.position, DIRECTIONS.TOP_RIGHT, false))
      this.addHighlight(this.board.getTopRightJump(piece.position));
  }

  addNotationToMove(move: Move) {
    move.notation = move.moves.map((val) => val + 1).join(move.jumping ? 'x' : '-');
  }

  pushToMoveStack(move: Move) {
    this.addNotationToMove(move);

    const table = document.getElementById('move-notation')! as HTMLTableElement;
    const moves = this.moveStack.length >> 1;
    const row = this.moveStack.length & 1 ? table.rows[moves + 1] : table.insertRow();
    const cell = row.insertCell(this.moveStack.length & 1);
    cell.innerHTML = move.notation || '';

    this.moveStack.push(move);
  }

  // Piece Movement
  handlePlayerMove(position: number) {
    this.inputting = false; // block inputs
    this.resetHighlights();

    const piece = this.board.selectedPiece!;
    const move: Move = {
      moves: [ piece.position, position ],
      jumping: this.jumping || this.board.jumpPieces.length > 0,
      promoting: !piece.king && this.board.isTopEdge(position),
    };

    if (move.jumping) {
      this.board.jump(move);
      this.board.tempCaptured.splice(0);
      this.board.jumpPieces.splice(0);

      if (this.captureMove) {
        this.captureMove.moves.push(position);
        this.captureMove.promoting = move.promoting;
      } else {
        this.captureMove = move;
      }

      if (!move.promoting) {
        // Check if the current piece can still capture
        this.highlightAdditionalJumps(piece);
        if (this.board.highlights.length > 0) {
          this.jumping = true;
          this.inputting = true;
          this.draw();
          return;
        }
      }

      this.pushToMoveStack(this.captureMove);
      this.captureMove = undefined;

      this.jumping = false;
    } else {
      this.board.move(move);
      this.pushToMoveStack(move);
    }

    this.board.playerTurn = false;
    this.board.selectedPiece = null;
    this.draw();

    this.passToAi();
  }

  // Turns
  setupTurn() {
    this.board.jumpPieces.splice(0);
    this.board.jumpPieces = this.getForceJumps(this.board.playerTurn);

    // Change State
    if (this.state === STATES.MID &&
        (this.board.aiPieces.length + this.board.playerPieces.length < 8)
    ) {
      this.state = STATES.END;
    }
  }

  passToAi() {
    this.setupTurn();
    if (this.gameOver(false)) {
      this.draw();
      return;
    }

    console.log('Ai Turn');

    this.ai.move();

    this.board.playerTurn = true;
    this.passToPlayer();
  }

  passToPlayer() {
    this.setupTurn();
    if (this.gameOver(true)) {
      this.draw();
      return;
    }

    console.log('Player Turn');

    this.inputting = true;
    this.draw();
  }

  hasMoves(player: boolean): boolean {
    if (player) {
      for (const piece of this.board.playerPieces) {
        if (this.board.isMovable(piece.position, DIRECTIONS.TOP_LEFT))
          return true;
        if (this.board.isMovable(piece.position, DIRECTIONS.TOP_RIGHT))
          return true;
        if (piece.king) {
          if (this.board.isMovable(piece.position, DIRECTIONS.BOTTOM_LEFT))
            return true;
          if (this.board.isMovable(piece.position, DIRECTIONS.BOTTOM_RIGHT))
            return true;
        }
      }
    } else {
      for (const piece of this.board.aiPieces) {
        if (this.board.isMovable(piece.position, DIRECTIONS.BOTTOM_LEFT))
          return true;
        if (this.board.isMovable(piece.position, DIRECTIONS.BOTTOM_RIGHT))
          return true;
        if (piece.king) {
          if (this.board.isMovable(piece.position, DIRECTIONS.TOP_LEFT))
            return true;
          if (this.board.isMovable(piece.position, DIRECTIONS.TOP_RIGHT))
            return true;
        }
      }
    }

    return false;
  }

  hasAvailableMoves(playerTurn: boolean): boolean {
    const jumping = this.board.jumpPieces.length > 0;
    if (jumping) {
      return true;
    } else {
      if (this.hasMoves(playerTurn))
        return true;
    }

    return false;
  }

  gameOver(player: boolean) {
    if (this.board.playerPieces.length === 0) {
      alert('You Lose');
      return true;
    }

    if (this.board.aiPieces.length === 0) {
      alert('You Win');
      return true;
    }

    if (!this.hasAvailableMoves(player)) {
      alert('Draw');
      return true;
    }

    return false;
  }

  getForceJumps(player: boolean): Piece[] {
    const jumpPieces: Piece[] = [];

    if (player) {
      for (const piece of this.board.playerPieces) {
        if (this.board.isJumpable(piece.position, DIRECTIONS.TOP_LEFT, false)) {
          jumpPieces.push(piece);
          continue;
        }

        if (this.board.isJumpable(piece.position, DIRECTIONS.TOP_RIGHT, false)) {
          jumpPieces.push(piece);
          continue;
        }

        if (piece.king) {
          if (this.board.isJumpable(piece.position, DIRECTIONS.BOTTOM_LEFT, false)) {
            jumpPieces.push(piece);
            continue;
          }

          if (this.board.isJumpable(piece.position, DIRECTIONS.BOTTOM_RIGHT, false)) {
            jumpPieces.push(piece);
            continue;
          }
        }
      }
    } else {
      for (const piece of this.board.aiPieces) {
        if (this.board.isJumpable(piece.position, DIRECTIONS.BOTTOM_LEFT, true)) {
          jumpPieces.push(piece);
          continue;
        }

        if (this.board.isJumpable(piece.position, DIRECTIONS.BOTTOM_RIGHT, true)) {
          jumpPieces.push(piece);
          continue;
        }

        if (piece.king) {
          if (this.board.isJumpable(piece.position, DIRECTIONS.TOP_LEFT, true)) {
            jumpPieces.push(piece);
            continue;
          }

          if (this.board.isJumpable(piece.position, DIRECTIONS.TOP_RIGHT, true)) {
            jumpPieces.push(piece);
            continue;
          }
        }
      }
    }

    return jumpPieces;
  }

  // Draw Functions
  draw() {
    this.drawTiles();
    this.drawPieces();
    this.drawHighlights();
    this.drawSelectedPiece();
    this.drawJumpPieces();
  }

  drawTiles() {
    this.graphics.beginFill(COLORS.BROWN);
    for (let y = 0; y < 8; y++) {
      for (let x = y & 1 ^ 1; x < 8; x += 2) {
        this.graphics.drawRect(
          x * TILE_SIZE, y * TILE_SIZE,
          TILE_SIZE, TILE_SIZE
        );
      }
    }
    this.graphics.endFill();
  }

  drawPieces() {
    const first = this.board.firstPlayerTurn ? COLORS.BLACK : COLORS.WHITE;
    const second = this.board.firstPlayerTurn ? COLORS.WHITE : COLORS.BLACK;
    this.graphics.lineStyle(OUTLINE_SIZE, second);
    this.graphics.beginFill(first);
    for (const piece of this.board.playerPieces) {
      this.graphics.drawShape(piece);
      if (piece.king) {
        this.graphics.beginFill(COLORS.RED);
        // TODO: Add king texture
        this.graphics.drawRect(
          piece.x - piece.radius / 2, piece.y - piece.radius / 2,
          piece.radius, piece.radius
        );
        this.graphics.beginFill(first);
      }
    }

    this.graphics.lineStyle(OUTLINE_SIZE, first);
    this.graphics.beginFill(second);
    for (const piece of this.board.aiPieces) {
      this.graphics.drawShape(piece);
      if (piece.king) {
        this.graphics.beginFill(COLORS.RED);
        // TODO: Add king texture
        this.graphics.drawRect(
          piece.x - piece.radius / 2, piece.y - piece.radius / 2,
          piece.radius, piece.radius
        );
        this.graphics.beginFill(second);
      }
    }

    this.graphics.lineStyle(0);
    this.graphics.endFill();
  }

  drawHighlights() {
    this.graphics.lineStyle(OUTLINE_SIZE, COLORS.WHITE);
    this.graphics.beginFill(undefined, 0);
    for (const highlight of this.board.highlights) {
      this.graphics.drawShape(highlight);
    }
    this.graphics.lineStyle(0);
    this.graphics.endFill();
  }

  drawSelectedPiece() {
    if (!this.board.selectedPiece) return;

    this.graphics.lineStyle(OUTLINE_SIZE, COLORS.YELLOW);
    this.graphics.beginFill(undefined, 0);

    this.graphics.drawShape(this.board.selectedPiece);

    this.graphics.lineStyle(0);
    this.graphics.endFill();
  }

  drawJumpPieces() {
    if (this.board.jumpPieces.length < 1) return;

    this.graphics.lineStyle(OUTLINE_SIZE, COLORS.RED);
    this.graphics.beginFill(undefined, 0);
    for (const pieces of this.board.jumpPieces) {
      this.graphics.drawShape(pieces);
    }
    this.graphics.lineStyle(0);
    this.graphics.endFill();
  }
}

export default Checkers;