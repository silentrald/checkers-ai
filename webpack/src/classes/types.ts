import Piece from './piece';
import Highlight from './highlight';

export type GridState = Piece | Highlight | null;

export interface Vector2d {
    x: number;
    y: number;
}

export interface Move {
    moves: Vector2d[];
    starting: Vector2d;
    ending: Vector2d;
    notation?: string;
    jumping?: boolean;
    promoted?: boolean;
}
