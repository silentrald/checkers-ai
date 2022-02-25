import * as PIXI from 'pixi.js';
import Board from './board';
import Piece from './piece';
import Input from './input';
import AI from './ai';
import { Move } from './types';

import COLORS from '../config/colors';
import { TILE_SIZE } from '../config/values';
import STATES from '../config/states';
import DIRECTIONS from '../config/directions';


class Checkers {
  board: Board;
  input: Input;
  ai: AI;
  app = new PIXI.Application();

  inputting = true;
  jumping = false;
  flipped = false;
  state = STATES.START;

  moveStack: Move[] = [];
  tempMoveStack: Move[] = [];
  captureMove: Move | undefined;

  constructor(fen?: string) {
    this.board = new Board(fen);
    this.input = new Input(this);
    this.ai = new AI(this);

    this.board.input = this.input;
    this.input.board = this.board;

    this.setup();
  }

  setup() {
    const size = TILE_SIZE * 8;
    this.app.renderer.resize(size, size);
    this.app.renderer.backgroundColor = COLORS.BEIGE;
    this.app.stage.addChild(this.board);
  }

  newGame() {
    this.state = STATES.START;
    this.inputting = true;
    this.jumping = false;
    this.moveStack = [];
    this.tempMoveStack = [];

    this.ai.setup();

    // Setup the rotation
    this.flipped = this.board.playerFirst;
    this.flip();

    this.board.playerTurn = this.board.playerFirst;
    if (this.board.playerFirst) {
      this.passToPlayer();
    } else {
      this.passToAi();
    }
  }

  flip() {
    this.flipped = !this.flipped;
    const val = this.flipped ? Math.PI : 0;
    this.board.transform.rotation = val;

    for (const piece of this.board.aiPieces)
      piece.transform.rotation = val;
    for (const piece of this.board.playerPieces)
      piece.transform.rotation = val;
    for (const piece of this.board.captured)
      piece.transform.rotation = val;
  }

  undo() {
    if (this.moveStack.length < 2)
      return;

    if (this.board.selectedPiece)
      this.board.selectedPiece.toggleSelected(false);
    this.resetHighlights();

    const move1 = this.popMoveStack();
    if (move1.jumping) {
      this.board.reverseJump(move1);
    } else {
      this.board.reverseMove(move1);
    }
    this.tempMoveStack.push(move1);

    const move2 = this.popMoveStack();
    if (move2.jumping) {
      this.board.reverseJump(move2);
    } else {
      this.board.reverseMove(move2);
    }
    this.tempMoveStack.push(move2);

    // Reconstruct Tree Opening
    this.ai.resetOpening();
    this.board.selectedPiece = null;

    this.passToPlayer();
  }

  redo() {
    if (this.tempMoveStack.length < 2)
      return;

    if (this.board.selectedPiece)
      this.board.selectedPiece.toggleSelected(false);
    this.resetHighlights();

    const move1 = this.tempMoveStack.pop() as Move;
    if (move1.jumping) {
      this.board.jump(move1);
    } else {
      this.board.move(move1);
    }
    this.pushToMoveStack(move1);

    const move2 = this.tempMoveStack.pop() as Move;
    if (move2.jumping) {
      this.board.jump(move2);
    } else {
      this.board.move(move2);
    }
    this.pushToMoveStack(move2);

    this.passToPlayer();
  }

  // Highlights
  resetHighlights() {
    for (const highlight of this.board.highlights)
      highlight.hide();
  }

  addHighlight(index: number, position: number) {
    const highlight = this.board.highlights[index];
    highlight.setPos(position);
    highlight.show();
  }

  highlightPlayerMoves(piece: Piece) {
    if (!piece.player) return;

    this.board.selectedPiece?.toggleSelected(false);
    this.board.selectedPiece = piece;
    piece.toggleSelected(true);
    this.resetHighlights();
    let index = 0;

    // Mandatory Jumps
    if (this.board.jumpPieces.length > 0) {
      if (piece.king) {
        if (this.board.isJumpable(piece.pos, DIRECTIONS.BOTTOM_LEFT, false))
          this.addHighlight(index++, this.board.getBottomLeftJump(piece.pos));
        if (this.board.isJumpable(piece.pos, DIRECTIONS.BOTTOM_RIGHT, false))
          this.addHighlight(index++, this.board.getBottomRightJump(piece.pos));
      }

      if (this.board.isJumpable(piece.pos, DIRECTIONS.TOP_LEFT, false))
        this.addHighlight(index++, this.board.getTopLeftJump(piece.pos));
      if (this.board.isJumpable(piece.pos, DIRECTIONS.TOP_RIGHT, false))
        this.addHighlight(index++, this.board.getTopRightJump(piece.pos));
    } else { // Normal Move
      if (piece.king) {
        if (this.board.isMovable(piece.pos, DIRECTIONS.BOTTOM_LEFT))
          this.addHighlight(index++, this.board.getBottomLeft(piece.pos));
        if (this.board.isMovable(piece.pos, DIRECTIONS.BOTTOM_RIGHT))
          this.addHighlight(index++, this.board.getBottomRight(piece.pos));
      }

      if (this.board.isMovable(piece.pos, DIRECTIONS.TOP_LEFT))
        this.addHighlight(index++, this.board.getTopLeft(piece.pos));
      if (this.board.isMovable(piece.pos, DIRECTIONS.TOP_RIGHT))
        this.addHighlight(index++, this.board.getTopRight(piece.pos));
    }
  }

  highlightAdditionalJumps(piece: Piece): number {
    let index = 0;

    if (piece.king && !this.board.isBottomEdge(piece.pos)) {
      if (this.board.isJumpable(piece.pos, DIRECTIONS.BOTTOM_LEFT, false))
        this.addHighlight(index++, this.board.getBottomLeftJump(piece.pos));
      if (this.board.isJumpable(piece.pos, DIRECTIONS.BOTTOM_RIGHT, false))
        this.addHighlight(index++, this.board.getBottomRightJump(piece.pos));
    }

    if (this.board.isJumpable(piece.pos, DIRECTIONS.TOP_LEFT, false))
      this.addHighlight(index++, this.board.getTopLeftJump(piece.pos));
    if (this.board.isJumpable(piece.pos, DIRECTIONS.TOP_RIGHT, false))
      this.addHighlight(index++, this.board.getTopRightJump(piece.pos));
    return index;
  }

  addNotationToMove(move: Move) {
    move.notation = move.moves.map((val) => val + 1).join(move.jumping ? 'x' : '-');
  }

  popMoveStack(): Move {
    const move = this.moveStack.pop() as Move;

    const table = document.getElementById('move-notation')! as HTMLTableElement;
    const moves = this.moveStack.length >> 1;
    const row = table.rows[moves + 1];
    row.deleteCell(this.moveStack.length & 1);
    if (row.cells.length === 0)
      table.deleteRow(moves + 1);

    return move;
  }

  pushToMoveStack(move: Move) {
    this.addNotationToMove(move);

    const table = document.getElementById('move-notation')! as HTMLTableElement;
    const tbody = table.tBodies[0];
    const moves = this.moveStack.length >> 1;
    const row = this.moveStack.length & 1 ? tbody.rows[moves] : tbody.insertRow();
    const cell = row.insertCell(this.moveStack.length & 1);
    cell.innerHTML = move.notation || '';
    cell.className = 'w-40';
    tbody.scrollTo(0, tbody.scrollHeight);

    this.moveStack.push(move);
  }

  // Piece Movement
  handlePlayerMove(position: number) {
    this.inputting = false; // block inputs
    this.resetHighlights();

    const piece = this.board.selectedPiece!;
    piece.toggleSelected(false);
    const move: Move = {
      moves: [ piece.pos, position ],
      jumping: this.jumping || this.board.jumpPieces.length > 0,
      promoting: !piece.king && this.board.isTopEdge(position),
    };

    if (move.jumping) {
      this.board.jump(move);
      for (const piece of this.board.jumpPieces) {
        piece.toggleJumping(false);
      }
      this.board.jumpPieces.splice(0);

      if (this.captureMove) {
        this.captureMove.moves.push(position);
        this.captureMove.promoting = move.promoting;
      } else {
        this.captureMove = move;
      }

      if (!move.promoting) {
        // Check if the current piece can still capture
        if (this.highlightAdditionalJumps(piece) > 0) {
          this.jumping = true;
          this.inputting = true;
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

    this.tempMoveStack = [];
    this.board.playerTurn = false;
    this.board.selectedPiece = null;

    setTimeout(() => {
      this.passToAi();
    }, 100);
  }

  // Turns
  setupTurn() {
    for (const piece of this.board.jumpPieces)
      piece.toggleJumping(false);
    this.board.jumpPieces.splice(0);
    this.board.jumpPieces = this.getForceJumps(this.board.playerTurn);

    // Change State
    if (this.state !== STATES.END && (
      this.moveStack.length > 40 ||
      this.board.aiPieces.length < 4 ||
      this.board.playerPieces.length < 4
    )) {
      this.state = STATES.END;
    }
  }

  passToAi() {
    this.setupTurn();
    if (this.gameOver(false)) {
      return;
    }

    // console.log('Ai Turn');

    this.ai.move();

    this.board.playerTurn = true;
    this.passToPlayer();
  }

  passToPlayer() {
    this.setupTurn();
    if (this.gameOver(true)) {
      return;
    }

    for (const piece of this.board.jumpPieces) {
      piece.toggleJumping(true);
    }

    // console.log('Player Turn');

    this.inputting = true;
  }

  hasMoves(player: boolean): boolean {
    if (player) {
      for (const piece of this.board.playerPieces) {
        if (this.board.isMovable(piece.pos, DIRECTIONS.TOP_LEFT))
          return true;
        if (this.board.isMovable(piece.pos, DIRECTIONS.TOP_RIGHT))
          return true;
        if (piece.king) {
          if (this.board.isMovable(piece.pos, DIRECTIONS.BOTTOM_LEFT))
            return true;
          if (this.board.isMovable(piece.pos, DIRECTIONS.BOTTOM_RIGHT))
            return true;
        }
      }
    } else {
      for (const piece of this.board.aiPieces) {
        if (this.board.isMovable(piece.pos, DIRECTIONS.BOTTOM_LEFT))
          return true;
        if (this.board.isMovable(piece.pos, DIRECTIONS.BOTTOM_RIGHT))
          return true;
        if (piece.king) {
          if (this.board.isMovable(piece.pos, DIRECTIONS.TOP_LEFT))
            return true;
          if (this.board.isMovable(piece.pos, DIRECTIONS.TOP_RIGHT))
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

  // TODO: Create proper gameover states
  gameOver(player: boolean) {
    if (this.board.playerPieces.length === 0) {
      // alert('You Lose');
      return true;
    }

    if (this.board.aiPieces.length === 0) {
      // alert('You Win');
      return true;
    }

    if (!this.hasAvailableMoves(player)) {
      // alert('Draw');
      return true;
    }

    return false;
  }

  getForceJumps(player: boolean): Piece[] {
    const jumpPieces: Piece[] = [];

    if (player) {
      for (const piece of this.board.playerPieces) {
        if (this.board.isJumpable(piece.pos, DIRECTIONS.TOP_LEFT, false)) {
          jumpPieces.push(piece);
          continue;
        }

        if (this.board.isJumpable(piece.pos, DIRECTIONS.TOP_RIGHT, false)) {
          jumpPieces.push(piece);
          continue;
        }

        if (piece.king) {
          if (this.board.isJumpable(piece.pos, DIRECTIONS.BOTTOM_LEFT, false)) {
            jumpPieces.push(piece);
            continue;
          }

          if (this.board.isJumpable(piece.pos, DIRECTIONS.BOTTOM_RIGHT, false)) {
            jumpPieces.push(piece);
            continue;
          }
        }
      }
    } else {
      for (const piece of this.board.aiPieces) {
        if (this.board.isJumpable(piece.pos, DIRECTIONS.BOTTOM_LEFT, true)) {
          jumpPieces.push(piece);
          continue;
        }

        if (this.board.isJumpable(piece.pos, DIRECTIONS.BOTTOM_RIGHT, true)) {
          jumpPieces.push(piece);
          continue;
        }

        if (piece.king) {
          if (this.board.isJumpable(piece.pos, DIRECTIONS.TOP_LEFT, true)) {
            jumpPieces.push(piece);
            continue;
          }

          if (this.board.isJumpable(piece.pos, DIRECTIONS.TOP_RIGHT, true)) {
            jumpPieces.push(piece);
            continue;
          }
        }
      }
    }

    return jumpPieces;
  }
}

export default Checkers;