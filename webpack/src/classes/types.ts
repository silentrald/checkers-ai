import Piece from './piece';
import Highlight from './highlight';

export type GridState = Piece | Highlight | null;

export interface Vector2d {
    x: number;
    y: number;
}

export interface Move {
    moves: Vector2d[];
    piece: Piece;
    starting: Vector2d;
    capturing: boolean;
    // promoted?: boolean;
}
