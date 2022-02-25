import Piece from './piece';
import Highlight from './highlight';
import {
  Container, Graphics, Ticker
} from 'pixi.js';

import {
  GridState, Move, Vector2d
} from './types';

import DIRECTIONS from '../config/directions';
import COLORS from '../config/colors';
import { HALF_TILE_SIZE, TILE_SIZE } from '../config/values';
import Input from './input';

class Board extends Container {
  state: string[] = [];
  grid: GridState[] = [];

  playerFirst = true;
  playerTurn = true;
  playerKings = 0;
  aiKings = 0;
  playerPieces: Piece[] = [];
  aiPieces: Piece[] = [];
  selectedPiece: Piece | null =  null;
  highlights: Highlight[] = [];
  jumpPieces: Piece[] = [];
  captured: Piece[] = [];

  // Input system
  input: Input | undefined;

  // Draw
  boardGraphics: Graphics = new Graphics();

  constructor(
    fen = 'B:W21,22,23,24,25,26,27,28,29,30,31,32:B1,2,3,4,5,6,7,8,9,10,11,12'
  ) {
    super();

    this.setup();
    this.setBoard(fen);
  }

  private setup() {
    // Draw Graphics
    this.boardGraphics.beginFill(COLORS.BROWN);
    for (let y = 0; y < 8; y++) {
      for (let x = y & 1 ^ 1; x < 8; x += 2) {
        this.boardGraphics.drawRect(
          x * TILE_SIZE, y * TILE_SIZE,
          TILE_SIZE, TILE_SIZE
        );
      }
    }
    this.boardGraphics.endFill();
    this.addChild(this.boardGraphics);

    this.pivot.x = TILE_SIZE * 4;
    this.pivot.y = TILE_SIZE * 4;
    this.x = TILE_SIZE * 4;
    this.y = TILE_SIZE * 4;

    // Init Grid
    for (let i = 0; i < 32; i++) {
      this.state.push('_');
      this.grid.push(null);
    }

    // Create 4 highlights
    for (let i = 0; i < 4; i++) {
      const highlight = new Highlight({
        pos: -1,
        board: this,
      });
      highlight.hide();
      this.highlights.push(highlight);
    }
  }

  private reset() {
    this.playerKings = 0;
    this.aiKings = 0;
    this.playerPieces = [];
    this.aiPieces = [];
    this.selectedPiece =  null;
    this.jumpPieces = [];
    this.captured = [];
    this.grid = [];
    this.state = [];

    // Init Grid
    for (let i = 0; i < 32; i++) {
      this.state.push('_');
      this.grid.push(null);
    }

    if (this.children.length > 1) {
      this.removeChildren(1);
    }

    for (const highlight of this.highlights) {
      highlight.hide();
    }
  }

  setCell(position: number, val: GridState) {
    this.grid[position] = val;

    let char = '_';
    if (val instanceof Piece) {
      char = val.player ? 'p' : 'a';
      if (val.king) char = char.toLocaleUpperCase();
    } else if (val instanceof Highlight) {
      char = 'H';
    }
    this.state[position] = char;
  }

  getCell(position: number): GridState {
    return this.grid[position];
  }

  getState(): string {
    // this.state.reverse();
    // let state = '';
    // for (let i = 0; i < 8; i++) {
    //   if (i & 1) {
    //     state += this.state.slice(i * 4, i * 4 + 4).join('*') + '*\n';
    //   } else {
    //     state += '*' + this.state.slice(i * 4, i * 4 + 4).join('*') + '\n';
    //   }
    // }
    // this.state.reverse();
    // return state + '-' + (this.playerTurn ? 'P' : 'A');
    return this.state.join('') + '-' + (this.playerTurn ? 'P' : 'A');
  }

  // input
  mousedownPiece(ev: any, piece: Piece) {
    if (!this.input) return;
    this.input.mousedownPiece(ev, piece);
  }

  mousedownHighlight(ev: any, highlight: Highlight) {
    if (!this.input) return;
    this.input.mousedownHighlight(ev, highlight);
  }

  // W - Ai
  // B - Player
  setBoard(fen: string) {
    this.reset();

    const [
      turn,
      whitePieces,
      blackPieces
    ] = fen.split(':');
    this.playerTurn = turn === 'B';

    let pos = 0, king = false;
    const first = this.playerFirst ? this.playerPieces : this.aiPieces;
    const second = this.playerFirst ? this.aiPieces : this.playerPieces;

    for (const p of blackPieces.slice(1).split(',')) {
      if (p[0] === 'K') {
        pos = +p.slice(1) - 1;
        king = true;
        this.playerKings++;
      } else {
        pos = +p - 1;
        king = false;
      }

      const piece = new Piece({
        pos,
        player: this.playerFirst,
        black: true,
        king,
        board: this,
      });
      first.push(piece);
      this.setCell(pos, piece);
      this.addChild(piece);
    }

    for (const p of whitePieces.slice(1).split(',')) {
      if (p[0] === 'K') {
        pos = +p.slice(1) - 1;
        king = true;
        this.aiKings++;
      } else {
        pos = +p - 1;
        king = false;
      }

      const piece = new Piece({
        pos,
        player: !this.playerFirst,
        black: false,
        king,
        board: this,
      });
      second.push(piece);
      this.setCell(pos, piece);
      this.addChild(piece);
    }

    // Add the highlights to the board
    for (const highlight of this.highlights) {
      this.addChild(highlight);
    }
  }

  // TODO: Get the fen string
  getBoard(): string {
    return '';
  }

  getDistance(p1: number, p2: number): number {
    const diff = Math.abs(p1 - p2);
    return (diff >> 2) + diff % 4;
  }

  getTopLeft(position: number): number {
    return this.playerFirst ?
      position + ((position >> 2) & 1 ? 4 : 5) : // tl
      position - ((position >> 2) & 1 ? 5 : 4);  // br
  }

  getTopRight(position: number): number {
    return this.playerFirst ?
      position + ((position >> 2) & 1 ? 3 : 4) : // tr
      position - ((position >> 2) & 1 ? 4 : 3);  // bl
  }

  getBottomLeft(position: number): number {
    return this.playerFirst ?
      position - ((position >> 2) & 1 ? 4 : 3) : // bl
      position + ((position >> 2) & 1 ? 3 : 4);  // tr
  }

  getBottomRight(position: number): number {
    return this.playerFirst ?
      position - ((position >> 2) & 1 ? 5 : 4) : // br
      position + ((position >> 2) & 1 ? 4 : 5);  // tl
  }

  getMiddle(start: number, end: number): number {
    return (start + end + ((start >> 2) & 1 ? -1 : 1)) >> 1;
  }

  getTopLeftJump(position: number): number {
    return this.playerFirst ? position + 9 : position - 9;
  }

  getTopRightJump(position: number): number {
    return this.playerFirst ? position + 7 : position - 7;
  }

  getBottomLeftJump(position: number): number {
    return this.playerFirst ? position - 7 : position + 7;
  }

  getBottomRightJump(position: number): number {
    return this.playerFirst ? position - 9 : position + 9;
  }

  // Move Check
  isValidPosition(position: number): boolean {
    return position > -1 && position < 32;
  }

  isTopEdge(position: number): boolean {
    return this.playerFirst ?
      position > 27 : // t
      position < 4;   // b
  }

  isTopJumpEdge(position: number): boolean {
    return this.playerFirst ?
      position > 23 : // t
      position < 8;   // b
  }

  isBottomEdge(position: number): boolean {
    return this.playerFirst ?
      position < 4 : // b
      position > 27; // t
  }

  isBottomJumpEdge(position: number): boolean {
    return this.playerFirst ?
      position < 8 : // b
      position > 23; // t
  }

  isLeftEdge(position: number): boolean {
    return this.playerFirst ?
      position % 8 === 3 : // l
      position % 8 === 4;  // r
  }

  isLeftJumpEdge(position: number): boolean {
    return this.playerFirst ?
      position % 4 === 3 : // l
      position % 4 === 0;  // r
  }

  isRightEdge(position: number): boolean {
    return this.playerFirst ?
      position % 8 === 4 : // r
      position % 8 === 3;  // l
  }

  isRightJumpEdge(position: number): boolean {
    return this.playerFirst ?
      position % 4 === 0 : // r
      position % 4 === 3;  // l
  }

  isEmpty(position: number): boolean {
    return !this.grid[position];
  }

  // Move Checks
  isMovable(start: number, direction: number): boolean {
    if (!this.isValidPosition(start))
      return false;

    switch (direction) {
    case DIRECTIONS.TOP_LEFT:
      return !this.isTopEdge(start) && !this.isLeftEdge(start) &&
        this.isEmpty(this.getTopLeft(start));
    case DIRECTIONS.TOP_RIGHT:
      return !this.isTopEdge(start) && !this.isRightEdge(start) &&
        this.isEmpty(this.getTopRight(start));
    case DIRECTIONS.BOTTOM_LEFT:
      return !this.isBottomEdge(start) && !this.isLeftEdge(start) &&
        this.isEmpty(this.getBottomLeft(start));
    case DIRECTIONS.BOTTOM_RIGHT:
      return !this.isBottomEdge(start) && !this.isRightEdge(start) &&
        this.isEmpty(this.getBottomRight(start));
    default:
      console.error('Invalid direction value in isJumpable method');
      return false;
    }
  }

  isJumpable(start: number, direction: number, opponent: boolean): boolean {
    if (!this.isValidPosition(start))
      return false;

    let end = 0;
    switch (direction) {
    case DIRECTIONS.TOP_LEFT:
      if (this.isTopJumpEdge(start) || this.isLeftJumpEdge(start))
        return false;
      end = this.getTopLeftJump(start);
      break;
    case DIRECTIONS.TOP_RIGHT:
      if (this.isTopJumpEdge(start) || this.isRightJumpEdge(start))
        return false;
      end = this.getTopRightJump(start);
      break;
    case DIRECTIONS.BOTTOM_LEFT:
      if (this.isBottomJumpEdge(start) || this.isLeftJumpEdge(start))
        return false;
      end = this.getBottomLeftJump(start);
      break;
    case DIRECTIONS.BOTTOM_RIGHT:
      if (this.isBottomJumpEdge(start) || this.isRightJumpEdge(start))
        return false;
      end = this.getBottomRightJump(start);
      break;
    default:
      console.error('Invalid direction value in isJumpable method');
      return false;
    }

    const mid = this.getMiddle(start, end);
    const cell = this.grid[mid];
    return cell instanceof Piece && cell.player === opponent && !this.grid[end];
  }

  // Move is not capturable
  isOccupiedByPieceOrKing(position: number, player: boolean): boolean {
    const cell = this.grid[position];
    return cell instanceof Piece && cell.player === player;
  }

  isOccupiedByKing(position: number, player: boolean): boolean {
    const cell = this.grid[position];
    return cell instanceof Piece && cell.player === player && cell.king;
  }

  // Open Square for Pieces
  isTopLeftOpen(position: number, player: boolean): boolean {
    const tl = this.getTopLeft(position);

    if (!this.isValidPosition(tl) || !this.isEmpty(tl))
      return false;

    if (tl > 27)
      return true;

    const trp = this.getTopRight(tl);
    if (this.isLeftEdge(tl)) // x = 0 // BUG: Did not consider jump cases
      return this.isEmpty(trp);

    const blp = this.getBottomLeft(tl);
    if (player) {
      return !(this.isOccupiedByPieceOrKing(this.getTopLeft(tl), false) || (
        this.isEmpty(blp) && this.isOccupiedByPieceOrKing(trp, false) ||
        this.isEmpty(trp) && this.isOccupiedByKing(blp, false)
      ));
    }

    return !(this.isOccupiedByKing(this.getTopLeft(tl), true) || (
      this.isEmpty(blp) && this.isOccupiedByKing(trp, true) ||
      this.isEmpty(trp) && this.isOccupiedByPieceOrKing(blp, true)
    ));
  }

  isTopRightOpen(position: number, player: boolean): boolean {
    const tr = this.getTopRight(position);

    // Top right check
    if (!this.isValidPosition(tr) || !this.isEmpty(tr))
      return false;
    if (tr > 27)
      return true;

    const tlp = this.getTopLeft(tr);
    if (this.isRightEdge(tr)) // x == 7 // BUG: Did not consider jump cases
      return this.isEmpty(tlp);

    const brp = this.getBottomRight(tr);
    if (player) {
      return !(this.isOccupiedByPieceOrKing(this.getTopRight(tr), false) || (
        this.isEmpty(brp) && this.isOccupiedByPieceOrKing(tlp, false) ||
        this.isEmpty(tlp) && this.isOccupiedByKing(brp, false)
      ));
    }

    return !(this.isOccupiedByKing(this.getTopRight(tr), true) || (
      this.isEmpty(brp) && this.isOccupiedByKing(tlp, true) ||
      this.isEmpty(tlp) && this.isOccupiedByPieceOrKing(brp, true)
    ));
  }

  isBottomLeftOpen(position: number, player: boolean): boolean {
    const bl = this.getBottomLeft(position);

    if (!this.isValidPosition(bl) || !this.isEmpty(bl))
      return false;
    if (this.isBottomEdge(bl))
      return true;

    const brp = this.getBottomRight(bl);
    if (this.isLeftEdge(bl))
      return this.isEmpty(brp);

    const tlp = this.getTopLeft(bl);
    if (player) {
      return !(this.isOccupiedByKing(this.getBottomLeft(bl), false) || (
        this.isEmpty(brp) && this.isOccupiedByPieceOrKing(tlp, false) ||
        this.isEmpty(tlp) && this.isOccupiedByKing(brp, false)
      ));
    }

    return !(this.isOccupiedByPieceOrKing(this.getBottomLeft(bl), true) || (
      this.isEmpty(brp) && this.isOccupiedByKing(tlp, true) ||
      this.isEmpty(tlp) && this.isOccupiedByPieceOrKing(brp, true)
    ));
  }

  isBottomRightOpen(position: number, player: boolean): boolean {
    const br = this.getBottomRight(position);

    if (!this.isValidPosition(br) || !this.isEmpty(br))
      return false;
    if (this.isBottomEdge(br))
      return true;

    const blp = this.getBottomLeft(br);
    if (this.isRightEdge(br))
      return this.isEmpty(blp);

    const trp = this.getTopRight(br);
    if (player) {
      return !(this.isOccupiedByKing(this.getBottomRight(br), false) || (
        this.isEmpty(blp) && this.isOccupiedByPieceOrKing(trp, false) ||
        this.isEmpty(trp) && this.isOccupiedByKing(blp, false)
      ));
    }

    return !(this.isOccupiedByPieceOrKing(this.getBottomRight(br), true) || (
      this.isEmpty(blp) && this.isOccupiedByKing(trp, true) ||
      this.isEmpty(trp) && this.isOccupiedByPieceOrKing(blp, true)
    ));
  }

  isRunaway(position: number, player: boolean): boolean {
    if (player) {
      if (position > 27)
        return true;

      if (this.isTopLeftOpen(position, player))
        return this.isRunaway(this.getTopLeft(position), player);
      if (this.isTopRightOpen(position, player))
        return this.isRunaway(this.getTopRight(position), player);
    } else {
      if (position < 4)
        return true;

      if (this.isBottomLeftOpen(position, player))
        return this.isRunaway(this.getBottomLeft(position), player);
      if (this.isBottomRightOpen(position, player))
        return this.isRunaway(this.getBottomRight(position), player);
    }

    return false;
  }

  isKingTrapped(position: number, player: boolean): boolean {
    const top = this.isTopEdge(position);
    const bot = this.isBottomEdge(position);
    const left = this.isLeftEdge(position);
    const right = this.isRightEdge(position);

    // Corner Checks
    if (bot && left)
      return !this.isTopRightOpen(position, player);
    if (top && right)
      return !this.isBottomLeftOpen(position, player);

    // Edge
    if (top) {
      if (position === 31) // Double Corner 31,27
        return !(this.isBottomRightOpen(31, player) &&
        (this.grid[27] ? true : this.isBottomRightOpen(27, player)));

      return !(this.isBottomLeftOpen(position, player) || this.isBottomRightOpen(position, player));
    }
    if (left) {
      if (position === 27) { // Double Corner 31,27
        return !(this.isBottomRightOpen(27, player) &&
          (this.grid[31] ? true : this.isBottomRightOpen(31, player)));
      }

      return !(this.isTopRightOpen(position, player) || this.isBottomRightOpen(position, player));
    }
    if (bot) {
      if (position === 0) { // Double Corner 0,4
        return !(this.isTopLeftOpen(0, player) &&
          (this.grid[4] ? true : this.isTopLeftOpen(4, player)));
      }
      return !(this.isTopLeftOpen(position, player) || this.isTopRightOpen(position, player));
    }
    if (right) {
      if (position === 4) { // Double Corner 0,4
        return !(this.isTopLeftOpen(4, player) &&
          (this.grid[0] ? true : this.isTopLeftOpen(0, player)));
      }
      return !(this.isTopLeftOpen(position, player) || this.isBottomLeftOpen(position, player));
    }

    // TODO: Check this if there is something wrong with the logic
    // if (x === 1 || x === 6 || y === 1 || y === 6) return false;

    // Center Trap
    return !(
      this.isTopLeftOpen(position, player) ||
      this.isTopRightOpen(position, player) ||
      this.isBottomLeftOpen(position, player) ||
      this.isBottomRightOpen(position, player)
    );
  }

  isPieceTrapped(position: number, player: boolean): boolean {
    if (player) {
      if (this.isLeftEdge(position))
        return this.isTopRightOpen(position, player);
      if (this.isRightEdge(position))
        return this.isTopLeftOpen(position, player);
      return this.isTopLeftOpen(position, player) || this.isTopRightOpen(position, player);
    }

    if (this.isLeftEdge(position))
      return this.isBottomLeftOpen(position, player);
    if (this.isRightEdge(position))
      return this.isBottomRightOpen(position, player);
    return this.isBottomLeftOpen(position, player) || this.isBottomRightOpen(position, player);
  }

  // Patterns
  isDogPattern(direction: number): boolean {
    if (direction === DIRECTIONS.BOTTOM_RIGHT) {
      const p1 = this.state[0];
      const p2 = this.state[4];
      return p1 === 'P' && p2 === 'A' || p1 === 'A' && p2 === 'P';
    }

    if (direction === DIRECTIONS.TOP_LEFT) {
      const p1 = this.state[31];
      const p2 = this.state[27];
      return p1 === 'P' && p2 === 'A' || p1 === 'A' && p2 === 'P';
    }

    return false;
  }

  countSafeMoves(position: number, player: boolean): number {
    return +this.isTopLeftOpen(position, player) +
      +this.isTopRightOpen(position, player) +
      +this.isBottomLeftOpen(position, player) +
      +this.isBottomLeftOpen(position, player);
  }

  // Methods
  promote(piece: Piece, promoting: boolean) {
    if (piece.king) return;

    if (promoting) {
      piece.toggleKing(true);
      if (piece.player) {
        this.playerKings++;
      } else {
        this.aiKings++;
      }
    }
  }

  move(move: Move) {
    const [ start, end ] = move.moves;

    const piece = this.getCell(start) as Piece;
    this.promote(piece, !!move.promoting);

    piece.setPos(end);
    this.setCell(start, null);
    this.setCell(end, piece);
  }

  private convertPosToVector(position: number): Vector2d {
    const y = 7 - (position >> 2);
    const x = (3 - (position % 4) << 1) + ((y + 1) & 1);
    return {
      x: x * TILE_SIZE + HALF_TILE_SIZE,
      y: y * TILE_SIZE + HALF_TILE_SIZE,
    };
  }

  jump(move: Move) {
    const [ start, ...positions ] = move.moves;

    // Move Current Piece
    const piece = this.getCell(start) as Piece;
    const end = positions[positions.length - 1];
    this.promote(piece, !!move.promoting);

    piece.setPos(end);
    this.setCell(start, null);
    this.setCell(end, piece);

    // Remove Captured Pieces
    let current = start;
    for (const pos of positions) {
      current = this.getMiddle(current, pos);

      const captured = this.getCell(current) as Piece;
      captured.hide();
      this.captured.push(captured);
      if (captured.player) {
        this.playerPieces.splice(this.playerPieces.indexOf(captured), 1);
        if (captured.king)
          this.playerKings--;
      } else {
        this.aiPieces.splice(this.aiPieces.indexOf(captured), 1);
        if (captured.king)
          this.aiKings--;
      }

      this.setCell(current, null);
      current = pos;
    }
  }

  demote(piece: Piece, promoting: boolean) {
    if (promoting) {
      piece.toggleKing(false);
      if (piece.player) {
        this.playerKings--;
      } else {
        this.aiKings--;
      }
    }
  }

  reverseMove(move: Move) {
    const [ start, end ] = move.moves;

    const piece = this.getCell(end) as Piece;
    this.demote(piece, !!move.promoting);

    piece.setPos(start);
    this.setCell(end, null);
    this.setCell(start, piece);
  }

  reverseJump(move: Move) {
    const start = move.moves[0];

    move.moves.reverse();
    const [ end, ...positions ] = move.moves;

    // Move Current Piece
    const piece = this.getCell(end) as Piece;
    this.demote(piece, !!move.promoting);
    piece.setPos(start);
    this.setCell(end, null);
    this.setCell(start, piece);

    // Remove Captured Pieces
    let current = end;
    for (const pos of positions) {
      current = this.getMiddle(current, pos);

      const captured = this.captured.pop() as Piece;
      captured.show();
      if (captured.player) {
        this.playerPieces.push(captured);
        if (captured.king)
          this.playerKings++;
      } else {
        this.aiPieces.push(captured);
        if (captured.king)
          this.aiKings++;
      }

      this.setCell(current, captured);
      current = pos;
    }

    move.moves.reverse();
  }

  convertNotationToMove(notation: string): Move {
    if (notation.indexOf('-') > -1) { // move
      const [ start, end ] = notation.split('-').map((val) => +val - 1);
      const piece = this.getCell(start) as Piece;
      return {
        moves: [ start, end ],
        promoting: !piece.king && (piece.player ?
          this.isTopEdge(end) :
          this.isBottomEdge(end)
        ),
        notation,
      } as Move;
    } else { // jump
      const moves = notation.split('x').map((val) => +val - 1);
      const piece = this.getCell(moves[0]) as Piece;
      return {
        moves,
        jumping: true,
        promoting: !piece.king && (piece.player ?
          this.isTopEdge(moves[moves.length - 1]) :
          this.isBottomEdge(moves[moves.length - 1])
        ),
        notation,
      };
    }
  }
}

export default Board;
