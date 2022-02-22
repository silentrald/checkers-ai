import { MoveConfig, Vector2d } from './types';

class Move {
  moves: Vector2d[];
  starting: Vector2d;
  ending: Vector2d;
  jumping: boolean;
  promoted: boolean;
  notation: string | undefined;

  constructor(config: MoveConfig) {
    this.moves = config.moves;
    this.starting = config.starting;
    this.ending = config.ending;
    this.jumping = !!config.jumping;
    this.promoted = !!config.promoted;
  }

  private getFENCell({ x, y, }: Vector2d): number {
    return (7 - y) * 4 + 3 - Math.floor(x / 2);
  }

  addJump(move: Move) {
    this.moves.push(move.ending);
    this.ending = move.ending;
    this.promoted = move.promoted;
  }

  getNotation(): string {
    if (this.notation)
      return this.notation;

    const start = this.getFENCell(this.starting);
    if (this.jumping) {
      let notation = `${start}`;
      for (const move of this.moves) {
        notation += 'x' + this.getFENCell(move);
      }
      this.notation = notation;
      return notation;
    }

    const end = this.getFENCell(this.ending);
    this.notation = start + '-' + end;
    return this.notation;
  }
}

export default Move;