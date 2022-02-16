import Piece from './piece';
import Highlight from './highlight';

import { GridState } from './types';

class Board {
  private state = {
    left: 0,
    right: 0,
    kings: 0,
  };
  private grid: GridState[][] = [];

  constructor() {
    // Init Grid
    for (let r = 0; r < 8; r++) {
      this.grid.push([]);
      for (let c = 0; c < 8; c++) {
        this.grid[r].push(null);
      }
    }
  }

  setCell(x: number, y: number, val: GridState) {
    this.grid[x][y] = val;

    let cell = -1;
    if (val instanceof Piece) {
      cell = +val.player + 1;
    } else if (val instanceof Highlight) {
      cell = 3;
    } else { // null
      cell = 0;
    }

    let offset = ((y << 2) + (x >> 1)) << 1;
    let ref: 'left' | 'right' = 'right';
    if (offset > 31) {
      offset -= 32;
      ref = 'left';
    }

    this.state[ref] = ((this.state[ref] & ~(0x3 << offset)) | (cell << offset)) >>> 0;
  }

  getCell(x: number, y: number): GridState {
    return this.grid[x][y];
  }

  setKing(x: number, y: number, king: boolean) {
    const offset = (y << 2) + (x >> 1);
    this.state.kings = (this.state.kings & ~(0x1 << offset) | (+king << offset)) >>> 0;
  }

  getState(): string {
    return this.state.left.toString(16).padStart(8, '0') +
      this.state.right.toString(16).padStart(8, '0') +
      this.state.kings.toString(16).padStart(8, '0');
  }

  // Move Check
  isTopLeftEmpty(x: number, y: number): boolean {
    return x > 0 && y > 0 && !this.grid[x - 1][y - 1];
  }

  isTopRightEmpty(x: number, y: number): boolean {
    return x < 7 && y > 0 && !this.grid[x + 1][y - 1];
  }

  isBottomLeftEmpty(x: number, y: number): boolean {
    return x > 0 && y < 7 && !this.grid[x - 1][y + 1];
  }

  isBottomRightEmpty(x: number, y: number): boolean {
    return x < 7 && y < 7 && !this.grid[x + 1][y + 1];
  }

  // Capture Checks
  isTopLeftCapturable(x: number, y: number, opponent: boolean): boolean {
    if (x < 2 || y < 2) return false;

    const cell = this.grid[x - 1][y - 1];
    return cell instanceof Piece && cell.player === opponent && !this.grid[x - 2][y - 2];
  }

  isTopRightCapturable(x: number, y: number, opponent: boolean): boolean {
    if (x > 5 || y < 2) return false;

    const cell = this.grid[x + 1][y - 1];
    return cell instanceof Piece && cell.player === opponent && !this.grid[x + 2][y - 2];
  }

  isBottomLeftCapturable(x: number, y: number, opponent: boolean): boolean {
    if (x < 2 || y > 5) return false;

    const cell = this.grid[x - 1][y + 1];
    return cell instanceof Piece && cell.player === opponent && !this.grid[x - 2][y + 2];
  }

  isBottomRightCapturable(x: number, y: number, opponent: boolean): boolean {
    if (x > 5 || y > 5) return false;

    const cell = this.grid[x + 1][y + 1];
    return cell instanceof Piece && cell.player === opponent && !this.grid[x + 2][y + 2];
  }

  // Move is not capturable
  isCellOccupiedByPieceOrKing(x: number, y: number, player: boolean): boolean {
    const cell = this.grid[x][y];
    return cell instanceof Piece && cell.player === player;
  }

  isCellOccupiedByKing(x: number, y: number, player: boolean): boolean {
    const cell = this.grid[x][y];
    return cell instanceof Piece && cell.player === player && cell.king;
  }

  isTopLeftPlayerPieceOpen(x: number, y: number): boolean {
    if (!this.isTopLeftEmpty(x, y))
      return false;

    x--; y--;

    // Edge Cases
    if (y === 0)
      return true;
    if (x === 0) // BUG: Did not consider jump cases
      return this.isTopRightEmpty(x, y);

    // Normal
    const bl = this.isBottomLeftEmpty(x, y);
    const tr = this.isTopRightEmpty(x, y);
    return !(this.isCellOccupiedByPieceOrKing(x - 1, y - 1, false) || (
      bl && this.isCellOccupiedByPieceOrKing(x + 1, y - 1, false) ||
        tr && this.isCellOccupiedByKing(x - 1, y + 1, false)
    ));
  }

  isTopRightPlayerPieceOpen(x: number, y: number): boolean {
    if (!this.isTopRightEmpty(x, y))
      return false;

    x++; y--;

    // Edge Cases
    if (y === 0)
      return true;
    if (x === 7) // BUG: Did not consider jump cases
      return this.isTopLeftEmpty(x, y);

    const br = this.isBottomRightEmpty(x, y);
    const tl = this.isTopLeftEmpty(x, y);
    return !(this.isCellOccupiedByPieceOrKing(x + 1, y - 1, false) || (
      br && this.isCellOccupiedByPieceOrKing(x - 1, y - 1, false) ||
        tl && this.isCellOccupiedByKing(x + 1, y + 1, false)
    ));
  }

  isBottomLeftAiPieceOpen(x: number, y: number): boolean {
    if (!this.isBottomLeftEmpty(x, y))
      return false;

    x--; y++;

    // Edge Cases
    if (y === 7)
      return true;
    if (x === 0) // BUG: Did not consider jump cases
      return this.isBottomRightEmpty(x, y);

    // Normal
    const br = this.isBottomRightEmpty(x, y);
    const tl = this.isTopLeftEmpty(x, y);
    return !(this.isCellOccupiedByPieceOrKing(x - 1, y + 1, true) || (
      br && this.isCellOccupiedByKing(x - 1, y - 1, true) ||
        tl && this.isCellOccupiedByPieceOrKing(x + 1, y + 1, true)
    ));
  }

  isBottomRightAiPieceOpen(x: number, y: number): boolean {
    if (!this.isBottomRightEmpty(x, y))
      return false;

    x++; y++;

    // Edge Cases
    if (y === 7)
      return true;
    if (x === 7) // BUG: Did not consider jump cases
      return this.isBottomLeftEmpty(x, y);

    // Normal
    const bl = this.isBottomLeftEmpty(x, y);
    const tr = this.isTopRightEmpty(x, y);
    return !(this.isCellOccupiedByPieceOrKing(x - 1, y + 1, true) || (
      bl && this.isCellOccupiedByKing(x + 1, y - 1, true) ||
        tr && this.isCellOccupiedByPieceOrKing(x - 1, y + 1, true)
    ));
  }

  isRunaway(x: number, y: number, player: boolean): boolean {
    if (player) {
      if (y === 0)
        return true;

      if (this.isTopLeftPlayerPieceOpen(x, y))
        return this.isRunaway(x - 1, y - 1, player);
      if (this.isTopRightPlayerPieceOpen(x, y))
        return this.isRunaway(x + 1, y - 1, player);
    } else {
      if (y === 7)
        return true;

      if (this.isBottomLeftAiPieceOpen(x, y))
        return this.isRunaway(x - 1, y + 1, player);
      if (this.isBottomRightAiPieceOpen(x, y))
        return this.isRunaway(x + 1, y + 1, player);
    }

    return false;
  }
}

export default Board;
