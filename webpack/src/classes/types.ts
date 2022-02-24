import Piece from './piece';
import Highlight from './highlight';

export type GridState = Piece | Highlight | null;

export interface Vector2d {
    x: number;
    y: number;
}

export interface Move {
    moves: number[];
    notation?: string;
    jumping?: boolean;
    promoting?: boolean;
}
