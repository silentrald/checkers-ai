import * as PIXI from 'pixi.js';
import Board from './board';
import Piece from './piece';
import Highlight from './highlight';
import Input from './input';
import AI from './ai';

import COLORS from '../config/colors';
import { OUTLINE_SIZE, TILE_SIZE } from '../config/values';
import STATES from '../config/states';

class Checkers {
  app = new PIXI.Application();
  graphics = new PIXI.Graphics();
  board = new Board();
  input = new Input(this);
  ai: AI = new AI(this);

  inputting = true;
  capturing = false;
  promoted = false;
  state = STATES.MID;

  constructor() {
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

    // Setup Pieces
    this.setupPieces();
    // this.setupEndgamePieces();

    // Redraw
    this.draw();

    if (!this.board.playerTurn) {
      this.passToAi();
    }
  }

  setupPieces() {
    // Setup Pieces
    let piece: Piece | undefined;
    for (let i = 0; i < 12; i++) {
      const x = i % 4 << 1;
      const y = Math.floor(i / 4);

      const pxAi = x + (y + 1 & 1);
      const pyAi = y;
      piece = new Piece(pxAi, pyAi, false);
      this.board.setCell(pxAi, pyAi, piece);
      this.board.aiPieces.push(piece);

      const pxPl = x + (y & 1);
      const pyPl = 7 - y;
      piece = new Piece(pxPl, pyPl, true);
      this.board.setCell(pxPl, pyPl, piece);
      this.board.playerPieces.push(piece);
    }
  }

  setupEndgamePieces() {
    this.state = STATES.END;
    let piece: Piece | undefined;
    const pieceList = [
      {
        x: 0,
        y: 1,
        player: true,
        king: false,
      }, {
        x: 1,
        y: 2,
        player: false,
        king: false,
      }
    ];
    for (const {
      x, y, player, king,
    } of pieceList) {
      piece = new Piece(x, y, player);
      piece.king = king;

      this.board.setCell(x, y, piece);
      this.board.setKing(x, y, king);

      if (player) {
        this.board.playerPieces.push(piece);
      } else {
        this.board.aiPieces.push(piece);
      }
    }
  }

  // Highlights
  resetHighlights() {
    for (const highlight of this.board.highlights) {
      const { x, y, } = highlight.position;
      this.board.setCell(x, y, null);
    }
    this.board.highlights.splice(0);
  }

  addHighlight(x: number, y: number) {
    const highlight = new Highlight(x, y);
    this.board.highlights.push(highlight);
    this.board.setCell(x, y, highlight);
  }

  highlightPlayerMoves(piece: Piece) {
    if (!piece.player) return;

    const { x, y, } = piece.position;
    this.board.selectedPiece = piece;
    this.resetHighlights();

    // Mandatory Jumps
    if (this.board.capturePieces.length > 0) {
      if (piece.king) {
        if (this.board.isBottomLeftCapturable(x, y, false))
          this.addHighlight(x - 2, y + 2);
        if (this.board.isBottomRightCapturable(x, y, false))
          this.addHighlight(x + 2, y + 2);
      }

      if (this.board.isTopLeftCapturable(x, y, false))
        this.addHighlight(x - 2, y - 2);
      if (this.board.isTopRightCapturable(x, y, false))
        this.addHighlight(x + 2, y - 2);
    } else { // Normal Move
      if (piece.king) {
        if (this.board.isBottomLeftEmpty(x, y))
          this.addHighlight(x - 1, y + 1);
        if (this.board.isBottomRightEmpty(x, y))
          this.addHighlight(x + 1, y + 1);
      }

      if (this.board.isTopLeftEmpty(x, y))
        this.addHighlight(x - 1, y - 1);
      if (this.board.isTopRightEmpty(x, y))
        this.addHighlight(x + 1, y - 1);
    }

    this.draw();
  }

  highlightAdditionalCaptures(piece: Piece) {
    const { x, y, } = piece.position;

    if (piece.king) {
      if (this.board.isBottomLeftCapturable(x, y, false))
        this.addHighlight(x - 2, y + 2);
      if (this.board.isBottomRightCapturable(x, y, false))
        this.addHighlight(x + 2, y + 2);
    }

    if (this.board.isTopLeftCapturable(x, y, false))
      this.addHighlight(x - 2, y - 2);
    if (this.board.isTopRightCapturable(x, y, false))
      this.addHighlight(x + 2, y - 2);
  }

  // Piece Movement
  handlePlayerMove(x: number, y: number) {
    this.inputting = false; // block inputs
    this.resetHighlights();

    const piece = this.board.selectedPiece!;

    if (this.capturing || this.board.capturePieces.length > 0) {
      this.capturePiece(piece, x, y);
      this.board.tempCaptured.splice(0);
      this.board.capturePieces.splice(0);

      if (!this.promoted) {
      // Check if the current piece can still capture
        this.highlightAdditionalCaptures(piece);
        if (this.board.highlights.length > 0) {
          this.capturing = true;
          this.inputting = true;
          this.draw();
          return;
        }
      }

      this.capturing = false;
      this.promoted = false;
    } else {
      this.movePiece(piece, x, y);
    }

    this.board.playerTurn = !this.board.playerTurn;
    this.board.selectedPiece = null;
    this.draw();

    this.passToAi();
  }

  promoteToKing(piece: Piece) {
    if (piece.king) return;

    const { x, y, } = piece.position;

    if (!piece.king) {
      if (piece.player) {
        if (y === 0) {
          piece.king = true;
          this.promoted = true;
          this.board.playerKings++;
          this.board.setKing(x, y, true);
        }
      } else {
        if (y === 7) {
          piece.king = true;
          this.promoted = true;
          this.board.aiKings++;
          this.board.setKing(x, y, true);
        }
      }
    }
  }

  demoteKing(piece: Piece) {
    const { x, y, } = piece.position;
    if (this.promoted && piece.king) {
      this.promoted = false;
      piece.king = false;
      this.board.setKing(x, y, false);
      if (piece.player) {
        this.board.playerKings--;
      } else {
        this.board.aiKings--;
      }
    }
  }

  private _movePiece(piece: Piece, x: number, y: number) {
    const { position: pos, } = piece;

    // Update the grid
    this.board.setCell(x, y, piece);
    this.board.setCell(pos.x, pos.y, null);

    // Move king value
    if (piece.king) {
      this.board.setKing(x, y, true);
      this.board.setKing(pos.x, pos.y, false);
    }

    // Update the piece
    piece.setPosition(x, y);
  }

  movePiece(piece: Piece, x: number, y: number) {
    this._movePiece(piece, x, y);
    this.promoteToKing(piece);
  }

  reverseMovePiece(piece: Piece, x: number, y: number) {
    this.demoteKing(piece);
    this._movePiece(piece, x, y);
  }

  capturePiece(piece: Piece, x: number, y: number) {
    const { position: pos, } = piece;

    // Get the center piece and delete it
    const capX = Math.abs(pos.x + x) >> 1;
    const capY = Math.abs(pos.y + y) >> 1;
    const captured = this.board.getCell(capX, capY) as Piece;
    this.board.setCell(capX, capY, null);
    this.board.tempCaptured.push(captured);

    // Move the piece
    this._movePiece(piece, x, y);

    if (captured.player) {
      this.board.playerPieces.splice(this.board.playerPieces.indexOf(captured), 1);
      if (captured.king) {
        this.board.playerKings--;
        this.board.setKing(capX, capY, false);
      }
    } else {
      this.board.aiPieces.splice(this.board.aiPieces.indexOf(captured), 1);
      if (captured.king) {
        this.board.aiKings--;
        this.board.setKing(capX, capY, false);
      }
    }
    this.promoteToKing(piece);
  }

  reverseCapturePiece(piece: Piece, x: number, y: number) {
    this.demoteKing(piece);

    // Move the piece
    this._movePiece(piece, x, y);

    // Get the captured piece and put it back
    const captured = this.board.tempCaptured.pop()!;
    const capX = captured.position.x;
    const capY = captured.position.y;
    this.board.setCell(capX, capY, captured);

    if (captured.player) {
      this.board.playerPieces.push(captured);
      if (captured.king) {
        this.board.playerKings++;
        this.board.setKing(capX, capY, true);
      }
    } else {
      this.board.aiPieces.push(captured);
      if (captured.king) {
        this.board.aiKings++;
        this.board.setKing(capX, capY, true);
      }
    }
  }

  // Turns
  setupTurn() {
    this.board.capturePieces.splice(0);
    this.board.capturePieces = this.getForceCaptures(this.board.playerTurn);
    this.promoted = false;

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

  hasMoves(playerTurn: boolean): boolean {
    if (playerTurn) {
      for (const piece of this.board.playerPieces) {
        const { x, y, } = piece.position;
        if (this.board.isTopLeftEmpty(x, y))
          return true;
        if (this.board.isTopRightEmpty(x, y))
          return true;
        if (piece.king) {
          if (this.board.isBottomLeftEmpty(x, y))
            return true;
          if (this.board.isBottomRightEmpty(x, y))
            return true;
        }
      }
    } else {
      for (const piece of this.board.aiPieces) {
        const { x, y, } = piece.position;
        if (this.board.isBottomLeftEmpty(x, y))
          return true;
        if (this.board.isBottomRightEmpty(x, y))
          return true;
        if (piece.king) {
          if (this.board.isTopLeftEmpty(x, y))
            return true;
          if (this.board.isTopRightEmpty(x, y))
            return true;
        }
      }
    }

    return false;
  }

  hasAvailableMoves(playerTurn: boolean): boolean {
    const capturing = this.board.capturePieces.length > 0;
    if (capturing) {
      return true;
    } else {
      if (this.hasMoves(playerTurn))
        return true;
    }

    return false;
  }

  gameOver(playerTurn: boolean) {
    if (this.board.playerPieces.length === 0) {
      alert('You Lose');
      return true;
    }

    if (this.board.aiPieces.length === 0) {
      alert('You Win');
      return true;
    }

    if (!this.hasAvailableMoves(playerTurn)) {
      alert('Draw');
      return true;
    }

    return false;
  }

  getForceCaptures(player: boolean): Piece[] {
    const capturePieces: Piece[] = [];

    if (player) {
      for (const piece of this.board.playerPieces) {
        const { x, y, } = piece.position;

        if (this.board.isTopLeftCapturable(x, y, false)) {
          capturePieces.push(piece);
          continue;
        }

        if (this.board.isTopRightCapturable(x, y, false)) {
          capturePieces.push(piece);
          continue;
        }

        if (piece.king) {
          if (this.board.isBottomLeftCapturable(x, y, false)) {
            capturePieces.push(piece);
            continue;
          }

          if (this.board.isBottomRightCapturable(x, y, false)) {
            capturePieces.push(piece);
            continue;
          }
        }
      }
    } else {
      for (const piece of this.board.aiPieces) {
        const { x, y, } = piece.position;

        if (this.board.isBottomLeftCapturable(x, y, true)) {
          capturePieces.push(piece);
          continue;
        }

        if (this.board.isBottomRightCapturable(x, y, true)) {
          capturePieces.push(piece);
          continue;
        }

        if (piece.king) {
          if (this.board.isTopLeftCapturable(x, y, true)) {
            capturePieces.push(piece);
            continue;
          }

          if (this.board.isTopRightCapturable(x, y, true)) {
            capturePieces.push(piece);
            continue;
          }
        }
      }
    }

    return capturePieces;
  }

  // Draw Functions
  draw() {
    this.drawTiles();
    this.drawPieces();
    this.drawHighlights();
    this.drawSelectedPiece();
    this.drawCapturePieces();
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
    this.graphics.lineStyle(OUTLINE_SIZE, COLORS.BLACK);
    this.graphics.beginFill(COLORS.WHITE);
    for (const piece of this.board.playerPieces) {
      this.graphics.drawShape(piece);
      if (piece.king) {
        this.graphics.beginFill(COLORS.RED);
        // TODO: Add king texture
        this.graphics.drawRect(
          piece.x - piece.radius / 2, piece.y - piece.radius / 2,
          piece.radius, piece.radius
        );
        this.graphics.beginFill(COLORS.WHITE);
      }
    }

    this.graphics.lineStyle(OUTLINE_SIZE, COLORS.WHITE);
    this.graphics.beginFill(COLORS.BLACK);
    for (const piece of this.board.aiPieces) {
      this.graphics.drawShape(piece);
      if (piece.king) {
        this.graphics.beginFill(COLORS.RED);
        // TODO: Add king texture
        this.graphics.drawRect(
          piece.x - piece.radius / 2, piece.y - piece.radius / 2,
          piece.radius, piece.radius
        );
        this.graphics.beginFill(COLORS.BLACK);
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

  drawCapturePieces() {
    if (this.board.capturePieces.length < 1) return;

    this.graphics.lineStyle(OUTLINE_SIZE, COLORS.RED);
    this.graphics.beginFill(undefined, 0);
    for (const pieces of this.board.capturePieces) {
      this.graphics.drawShape(pieces);
    }
    this.graphics.lineStyle(0);
    this.graphics.endFill();
  }
}

export default Checkers;