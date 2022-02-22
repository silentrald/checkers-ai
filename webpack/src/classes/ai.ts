import Checkers from './checkers';
import Board from './board';
import Piece from './piece';
import Heuristic from './heuristic';
import Move from './move';

import { Vector2d } from './types';
import { MAX_DEPTH_MID, MAX_DEPTH_END } from '../config/values';
import STATES from '../config/states';

const FLAGS = {
  UPPERBOUND: 0,
  LOWERBOUND: 1,
  EXACT: 2,
};

interface TranspositionData {
  value: number;
  depth: number;
  flag: number;
}

interface MatingTree {
  children: MatingTree[];
  move: Move;
  count: number;
  mate: boolean;
  state: string;
}

class AI {
  checkers: Checkers;
  board: Board;
  heuristic: Heuristic;
  heuristicMemo: { [key: string]: number } = {};
  transpositionTable: { [key: string]: TranspositionData } = {};
  treeWalk: { [key: string]: boolean } = {};
  matingTree: MatingTree | undefined;
  mateMemo: { [key: string]: { node: MatingTree; depth: number; } } = {};

  constructor(checkers: Checkers) {
    this.checkers = checkers;
    this.board = checkers.board;
    this.heuristic = new Heuristic(checkers);
  }

  private searchAllPossibleJumpMoves(
    piece: Piece, ending: Vector2d,
    moves: Vector2d[], output: Vector2d[][]
  ) {
    moves.push(ending);
    const move = new Move({
      starting: {
        ...piece.position,
      },
      ending,
      moves: [ ending ],
      jumping: true,
    });
    this.checkers.jump(move);


    if (!this.checkers.promoted) {
      const temp = this.getAllPossibleJumpMoves(piece, [ ...moves ]);
      if (temp.length < 1) {
        output.push([ ...moves ]);
      } else {
        output.push(...temp);
      }
    } else {
      output.push([ ...moves ]);
    }

    moves.pop();
    this.checkers.reverseJump(move);
  }

  private getAllPossibleJumpMoves(piece: Piece, moves: Vector2d[]): Vector2d[][] {
    const { x, y, } = piece.position;
    const output: Vector2d[][] = [];

    if (piece.player) {
      if (piece.king) {
        if (this.board.isBottomLeftCapturable(x, y, false)) {
          const pos = {
            x: x - 2,
            y: y + 2,
          };
          this.searchAllPossibleJumpMoves(piece, pos, moves, output);
        }
        if (this.board.isBottomRightCapturable(x, y, false)) {
          const pos = {
            x: x + 2,
            y: y + 2,
          };
          this.searchAllPossibleJumpMoves(piece, pos, moves, output);
        }
      }

      if (this.board.isTopLeftCapturable(x, y, false)) {
        const pos = {
          x: x - 2,
          y: y - 2,
        };
        this.searchAllPossibleJumpMoves(piece, pos, moves, output);
      }
      if (this.board.isTopRightCapturable(x, y, false)) {
        const pos = {
          x: x + 2,
          y: y - 2,
        };
        this.searchAllPossibleJumpMoves(piece, pos, moves, output);
      }
    } else {
      if (piece.king) {
        if (this.board.isTopLeftCapturable(x, y, true)) {
          const pos = {
            x: x - 2,
            y: y - 2,
          };
          this.searchAllPossibleJumpMoves(piece, pos, moves, output);
        }
        if (this.board.isTopRightCapturable(x, y, true)) {
          const pos = {
            x: x + 2,
            y: y - 2,
          };
          this.searchAllPossibleJumpMoves(piece, pos, moves, output);
        }
      }

      if (this.board.isBottomLeftCapturable(x, y, true)) {
        const pos = {
          x: x - 2,
          y: y + 2,
        };
        this.searchAllPossibleJumpMoves(piece, pos, moves, output);
      }
      if (this.board.isBottomRightCapturable(x, y, true)) {
        const pos = {
          x: x + 2,
          y: y + 2,
        };
        this.searchAllPossibleJumpMoves(piece, pos, moves, output);
      }
    }

    return output;
  }

  getAllPossibleMoves(player: boolean): Move[] {
    const rootMoves: Move[] = [];

    const jumpPieces = this.checkers.getForceJumps(player);

    if (jumpPieces.length > 0) {
      for (const piece of jumpPieces) {
        const allMoves = this.getAllPossibleJumpMoves(piece, []);
        for (const moves of allMoves) {
          rootMoves.push(new Move({
            moves: [ ...moves ],
            starting: {
              ...piece.position,
            },
            ending: moves[moves.length - 1],
            jumping: true,
          }));
        }
      }
    } else if (player) {
      for (const piece of this.board.playerPieces) {
        const { x, y, } = piece.position;
        if (piece.king) {
          if (this.board.isBottomLeftEmpty(x, y)) {
            const move = {
              x: x - 1,
              y: y + 1,
            };
            rootMoves.push(new Move({
              moves: [ move ],
              starting: {
                ...piece.position,
              },
              ending: move,
            }));
          }
          if (this.board.isBottomRightEmpty(x, y)) {
            const move = {
              x: x + 1,
              y: y + 1,
            };
            rootMoves.push(new Move({
              moves: [ move ],
              starting: {
                ...piece.position,
              },
              ending: move,
            }));
          }
        }

        if (this.board.isTopLeftEmpty(x, y)) {
          const move = {
            x: x - 1,
            y: y - 1,
          };
          rootMoves.push(new Move({
            moves: [ move ],
            starting: {
              ...piece.position,
            },
            ending: move,
          }));
        }
        if (this.board.isTopRightEmpty(x, y)) {
          const move = {
            x: x + 1,
            y: y - 1,
          };
          rootMoves.push(new Move({
            moves: [ move ],
            starting: {
              ...piece.position,
            },
            ending: move,
          }));
        }
      }
    } else {
      for (const piece of this.board.aiPieces) {
        const { x, y, } = piece.position;
        if (piece.king) {
          if (this.board.isTopLeftEmpty(x, y)) {
            const move =  {
              x: x - 1,
              y: y - 1,
            };
            rootMoves.push(new Move({
              moves: [ move ],
              starting: {
                ...piece.position,
              },
              ending: move,
            }));
          }
          if (this.board.isTopRightEmpty(x, y)) {
            const move = {
              x: x + 1,
              y: y - 1,
            };
            rootMoves.push(new Move({
              moves: [ move ],
              starting: {
                ...piece.position,
              },
              ending: move,
            }));
          }
        }

        if (this.board.isBottomLeftEmpty(x, y)) {
          const move = {
            x: x - 1,
            y: y + 1,
          };
          rootMoves.push(new Move({
            moves: [ move ],
            starting: {
              ...piece.position,
            },
            ending: move,
          }));
        }
        if (this.board.isBottomRightEmpty(x, y)) {
          const move = {
            x: x + 1,
            y: y + 1,
          };

          rootMoves.push(new Move({
            moves: [ move ],
            starting: {
              ...piece.position,
            },
            ending: move,
          }));
        }
      }
    }

    return rootMoves;
  }

  private _move(move: Move) {
    if (move.jumping) {
      this.checkers.jump(move);
    } else {
      this.checkers.move(move);
    }

    this.board.playerTurn = !this.board.playerTurn;
    move.promoted = this.checkers.promoted;
    this.checkers.promoted = false;
  }

  private _reverseMove(move: Move) {
    this.checkers.promoted = !!move.promoted;
    this.board.playerTurn = !this.board.playerTurn;

    if (move.jumping) {
      this.checkers.reverseJump(move);
    } else {
      this.checkers.reverseMove(move);
    }
  }

  private quesceneSearch(
    alpha: number, beta: number,
    player: boolean
  ): number {
    if (this.board.playerPieces.length === 0)
      return 2000;
    if (this.board.aiPieces.length === 0)
      return -2000;

    const jumpPieces = this.checkers.getForceJumps(player);
    const capturing = jumpPieces.length > 0;

    if (!capturing) {
      const heuristic = this.heuristic.getHeuristic();
      const state = this.board.getState();
      this.heuristicMemo[state] = heuristic;
      return heuristic;
    }

    let val = 0;
    if (player) { // Player
      val = Infinity;
      for (const piece of jumpPieces) {
        const jumpMoves = this.getAllPossibleJumpMoves(piece, []);
        for (const moves of jumpMoves) {
          const move = new Move({
            moves: [ ...moves ],
            starting: {
              ...piece.position,
            },
            ending: moves[moves.length - 1],
            jumping: true,
          });
          this._move(move);
          val = Math.min(val, this.quesceneSearch(alpha, beta, false));
          this._reverseMove(move);

          if (val <= alpha) return val;
          beta = Math.min(beta, val);
        }
      }
    } else { // AI
      val = -Infinity;
      for (const piece of jumpPieces) {
        const jumpMoves = this.getAllPossibleJumpMoves(piece, []);
        for (const moves of jumpMoves) {
          const move = new Move({
            moves: [ ...moves ],
            starting: {
              ...piece.position,
            },
            ending: moves[moves.length - 1],
            jumping: true,
          });
          this._move(move);
          val = Math.max(val, this.quesceneSearch(alpha, beta, true));
          this._reverseMove(move);

          if (val >= beta) return val;
          alpha = Math.max(alpha, val);
        }
      }
    }

    return val;
  }

  private negamax(depth: number, alpha: number, beta: number, color: number): number {
    const player = color < 0;
    const state = this.board.getState();
    const originalAlpha = alpha;

    // Transposition Table
    let entry: TranspositionData | undefined = this.transpositionTable[state];
    if (entry && entry.depth >= depth) {
      if (entry.flag === FLAGS.EXACT)
        return entry.value;
      else if (entry.flag === FLAGS.LOWERBOUND)
        alpha = Math.max(alpha, entry.value);
      else
        beta = Math.min(beta, entry.value);

      if (alpha >= beta)
        return entry.value;
    }

    if (this.board.playerPieces.length === 0)
      return 2000 * color;
    if (this.board.aiPieces.length === 0)
      return -2000 * color;

    if (depth < 1)
      return this.quesceneSearch(alpha, beta, player) * color;

    let max = -2000;

    const allMoves = this.getAllPossibleMoves(player);
    allMoves.sort((a, b) => a.moves.length - b.moves.length);
    // Prioritize moves to the center of the board
    // allMoves.sort((m1, m2) =>
    //   Math.abs(m1.ending.x - 3.5) + Math.abs(m1.ending.y - 3.5) -
    //   Math.abs(m2.ending.x - 3.5) - Math.abs(m2.ending.y - 3.5)
    // );

    this.treeWalk[state] = true;
    for (const moves of allMoves) {
      this._move(moves);
      max = Math.max(max, -this.negamax(depth - 1, -beta, -alpha, -color));
      this._reverseMove(moves);

      alpha = Math.max(alpha, max);
      if (alpha >= beta) break;
    }
    this.treeWalk[state] = false;

    let flag = FLAGS.EXACT;
    if (max <= originalAlpha)
      flag = FLAGS.UPPERBOUND;
    else if (max >= beta)
      flag = FLAGS.LOWERBOUND;

    entry = {
      value: max,
      depth,
      flag,
    };
    this.transpositionTable[state] = entry;

    return max;
  }

  private minimax(
    depth: number,
    alpha: number, beta: number,
    player: boolean
  ): number {
    if (player)
      return -this.negamax(depth, -beta, -alpha, -1);
    else
      return this.negamax(depth, alpha, beta, 1);
  }

  private mateSearch(move: Move, depth: number, player: boolean): MatingTree {
    const state = this.board.getState();

    const cache = this.mateMemo[state];
    if (cache && cache.depth >= depth) {
      const node = {
        ...cache.node,
      };
      node.move = move;
      return node;
    }

    const node: MatingTree = {
      children: [],
      move,
      count: Infinity,
      mate: false,
      state,
    };

    if (this.treeWalk[state]) {
      node.count = MAX_DEPTH_END;
      node.mate = true;
      return node;
    }

    if (this.board.playerPieces.length === 0) {
      node.count = 0;
      node.mate = true;
      this.mateMemo[state] = {
        node,
        depth,
      };

      return node;
    }

    if (this.board.aiPieces.length === 0) {
      this.mateMemo[state] = {
        node,
        depth,
      };

      return node;
    }

    if (depth < 1) {
      const mate = this.quesceneSearch(-Infinity, Infinity, player) > 999;
      node.count = mate ? 0 : MAX_DEPTH_END;
      node.mate = true;
      return node;
    }

    const allMoves = this.getAllPossibleMoves(player);
    if (allMoves.length === 0) {
      this.mateMemo[state] = {
        node,
        depth,
      };
      return node;
    }

    this.treeWalk[state] = false;

    if (player) {
      // All should be a mate threat
      let max = -Infinity;
      node.mate = true;

      for (const newMove of allMoves) {
        this._move(newMove);
        const child = this.mateSearch(newMove, depth - 1, false);
        this._reverseMove(newMove);

        if (!child.mate) {
          max = Infinity;
          node.children = [];
          node.mate = false;
          break;
        }

        max = Math.max(max, child.count);
        node.children.push(child);
      }

      node.count = max;
    } else {
      // At least 1 mate threat
      let min = Infinity;
      for (const newMove of allMoves) {
        this._move(newMove);
        const child = this.mateSearch(newMove, depth - 1, true);

        if (child.mate) {
          if (child.count < min) {
            min = child.count;
            node.count = min;
            node.children = [ {
              ...child,
            } ];
          }
          node.mate = true;
        }

        this._reverseMove(newMove);
      }
      node.count++;
    }

    this.mateMemo[state] = {
      node,
      depth,
    };
    this.treeWalk[state] = false;

    return node;
  }

  move() {
    if (this.matingTree) {
      const state = this.board.getState();
      const matingTree = this.matingTree.children.find((mt) => mt.state === state)!;

      this.matingTree = matingTree.children[0];
      if (this.matingTree) {
        this._move(this.matingTree.move);
        this.board.tempCaptured.splice(0);
        return;
      }
    }

    let depth = 0;
    switch (this.checkers.state) {
    case STATES.START:
    case STATES.MID:
      depth = MAX_DEPTH_MID;
      break;
    case STATES.END:
      depth = Math.min(
        MAX_DEPTH_MID,
        MAX_DEPTH_END - this.board.aiPieces.length - this.board.playerPieces.length
      );
      break;
    }

    // Check for moves
    const rootMoves = this.getAllPossibleMoves(false);

    if (rootMoves.length === 1) {
      this._move(rootMoves[0]);
      this.board.tempCaptured.splice(0);
      return;
    }

    // Minimax for rootMoves
    let bestMove: Move = rootMoves[0];
    let heuristic = 0;
    let max = -Infinity;

    for (const move of rootMoves) {
      this._move(move);
      heuristic = this.minimax(depth, -Infinity, Infinity, true);
      console.log(heuristic, move);
      if (heuristic > max) {
        max = heuristic;
        bestMove = move;
      }

      this._reverseMove(move);

      if (heuristic > 999) {
        break;
      }
    }

    if (heuristic > 999) {
      rootMoves.splice(0, rootMoves.indexOf(bestMove) + 1);

      this._move(bestMove);
      this.matingTree = this.mateSearch(bestMove, depth, true);
      this._reverseMove(bestMove);
      // Mate search
      let matingTree: MatingTree | undefined;
      for (const move of rootMoves) {
        this._move(move);
        heuristic = this.minimax(depth, -Infinity, Infinity, true);

        if (heuristic < 1000) {
          this._reverseMove(move);
          continue;
        }

        matingTree = this.mateSearch(move, depth, true);

        this._reverseMove(move);

        if (matingTree.count < this.matingTree.count) {
          this.matingTree = matingTree;
          bestMove = move;
        }
      }

      // console.log(this.matingTree.state);
      // console.log(bestMove);
      // console.log(this.matingTree);
    }

    this._move(bestMove);
    this.board.tempCaptured.splice(0);
    this.transpositionTable = {};
    this.heuristicMemo = {};
  }
}

export default AI;
