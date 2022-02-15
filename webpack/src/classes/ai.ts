import Checkers from './checkers';
import Board from './board';
import Piece from './piece';
import Heuristic from './heuristic';

import { Move, Vector2d } from './types';
import { MAX_DEPTH } from '../config/values';

class TreeNode {
  children: TreeNode[] = [];
  heuristic = 0;
}

class AI {
  checkers: Checkers;
  board: Board;
  heuristic: Heuristic;
  heuristicMemo: { [key: string]: number } = {};
  transpositionTable: { [key: string]: TreeNode } = {};

  constructor(checkers: Checkers) {
    this.checkers = checkers;
    this.board = checkers.board;
    this.heuristic = new Heuristic(checkers);
  }

  private searchAllPossibleCaptureMoves(
    piece: Piece, x: number, y: number,
    moves: Vector2d[], output: Vector2d[][]
  ) {
    const pos = {
      ...piece.position,
    };
    this.checkers.capturePiece(piece, x, y);
    moves.push({
      x,
      y,
    });

    if (!this.checkers.promoted) {
      const temp = this.getAllPossibleCaptureMoves(piece, [ ...moves ]);
      if (temp.length < 1) {
        output.push([ ...moves ]);
      } else {
        output.push(...temp);
      }
    } else {
      output.push([ ...moves ]);
    }


    moves.pop();
    this.checkers.reverseCapturePiece(piece, pos.x, pos.y);
  }

  private getAllPossibleCaptureMoves(piece: Piece, moves: Vector2d[]): Vector2d[][] {
    const { x, y, } = piece.position;
    const output: Vector2d[][] = [];

    if (piece.player) {
      if (piece.king) {
        if (this.board.isBottomLeftCapturable(x, y, false)) {
          this.searchAllPossibleCaptureMoves(
            piece, x - 2, y + 2, moves, output
          );
        }
        if (this.board.isBottomRightCapturable(x, y, false)) {
          this.searchAllPossibleCaptureMoves(
            piece, x + 2, y + 2, moves, output
          );
        }
      }

      if (this.board.isTopLeftCapturable(x, y, false)) {
        this.searchAllPossibleCaptureMoves(
          piece, x - 2, y - 2, moves, output
        );
      }
      if (this.board.isTopRightCapturable(x, y, false)) {
        this.searchAllPossibleCaptureMoves(
          piece, x + 2, y - 2, moves, output
        );
      }
    } else {
      if (piece.king) {
        if (this.board.isTopLeftCapturable(x, y, true)) {
          this.searchAllPossibleCaptureMoves(
            piece, x - 2, y - 2, moves, output
          );
        }
        if (this.board.isTopRightCapturable(x, y, true)) {
          this.searchAllPossibleCaptureMoves(
            piece, x + 2, y - 2, moves, output
          );
        }
      }

      if (this.board.isBottomLeftCapturable(x, y, true)) {
        this.searchAllPossibleCaptureMoves(
          piece, x - 2, y + 2, moves, output
        );
      }
      if (this.board.isBottomRightCapturable(x, y, true)) {
        this.searchAllPossibleCaptureMoves(
          piece, x + 2, y + 2, moves, output
        );
      }
    }

    return output;
  }

  getAllPossibleMoves(): Move[] {
    const rootMoves: Move[] = [];

    if (this.checkers.capturePieces.length > 0) {
      for (const piece of this.checkers.capturePieces) {
        const moves = this.getAllPossibleCaptureMoves(piece, []);
        for (const m of moves) {
          rootMoves.push({
            moves: m,
            piece,
            starting: {
              ...piece.position,
            },
            capturing: true,
          });
        }
      }
    } else {
      for (const piece of this.checkers.aiPieces) {
        const { x, y, } = piece.position;
        if (piece.king) {
          if (this.board.isTopLeftEmpty(x, y)) {
            rootMoves.push({
              piece,
              moves: [ {
                x: x - 1,
                y: y - 1,
              } ],
              starting: {
                ...piece.position,
              },
              capturing: false,
            });
          }
          if (this.board.isTopRightEmpty(x, y)) {
            rootMoves.push({
              piece,
              moves: [ {
                x: x + 1,
                y: y - 1,
              } ],
              starting: {
                ...piece.position,
              },
              capturing: false,
            });
          }
        }

        if (this.board.isBottomLeftEmpty(x, y)) {
          rootMoves.push({
            piece,
            moves:[ {
              x: x - 1,
              y: y + 1,
            } ],
            starting: {
              ...piece.position,
            },
            capturing: false,
          });
        }
        if (this.board.isBottomRightEmpty(x, y)) {
          rootMoves.push({
            moves: [ {
              x: x + 1,
              y: y + 1,
            } ],
            piece,
            starting: {
              ...piece.position,
            },
            capturing: false,
          });
        }
      }
    }

    return rootMoves;
  }

  private _move(move: Move) {
    const {
      piece, moves, capturing,
    } = move;
    if (capturing) {
      for (const { x, y, } of moves)
        this.checkers.capturePiece(piece, x, y);
    } else {
      for (const { x, y, } of moves)
        this.checkers.movePiece(piece, x, y);
    }
  }

  private _reverseMove(move: Move) {
    const {
      piece, moves, starting, capturing,
    } = move;

    const temp = moves.pop(); // Remove last move
    moves.reverse();
    if (capturing) {
      for (const { x, y, } of moves)
        this.checkers.reverseCapturePiece(piece, x, y);
      this.checkers.reverseCapturePiece(piece, starting.x, starting.y);
    } else {
      for (const { x, y, } of moves)
        this.checkers.reverseMovePiece(piece, x, y);
      this.checkers.reverseMovePiece(piece, starting.x, starting.y);
    }

    moves.reverse();
    moves.push(temp!); // Push it back the moves list
  }

  private _branch(
    parent: TreeNode, move: Move,
    depth: number, playerTurn: boolean
  ) {
    this._move(move);

    const state = this.board.getState();
    let child = this.transpositionTable[state];
    if (!child) {
      child = new TreeNode();

      const promoted = this.checkers.promoted;
      this.checkers.promoted = false;
      this.branchSearchTree(child, depth - 1, !playerTurn);
      this.checkers.promoted = promoted;

      this.transpositionTable[state] = child;
    }
    parent.children.push(child);

    this._reverseMove(move);
  }

  private _setLeafNode(parent: TreeNode) {
    const state = this.board.getState();
    let heuristic = this.heuristicMemo[state];
    if (heuristic === undefined) {
      heuristic = this.heuristic.getHeuristic();
      this.heuristicMemo[state] = heuristic;
    }
    parent.heuristic = heuristic;
  }

  private branchSearchTree(parent: TreeNode, depth: number, playerTurn: boolean) {
    // Check if you can branch out
    const capturePieces = this.checkers.getForceCaptures(playerTurn);
    if (capturePieces.length > 0) {
      for (const piece of capturePieces) {
        const captureMoves = this.getAllPossibleCaptureMoves(piece, []);
        for (const moves of captureMoves) {
          const move = {
            piece,
            moves,
            starting: {
              ...piece.position,
            },
            capturing: true,
          };
          this._branch(parent, move, depth, playerTurn);
        }
      }

      if (parent.children.length === 0)
        this._setLeafNode(parent);

      return;
    }

    if (depth < 1) {
      this._setLeafNode(parent);
      return;
    }

    if (playerTurn) {
      for (const piece of this.checkers.playerPieces) {
        const { x, y, } = piece.position;
        if (piece.king) {
          if (this.board.isBottomLeftEmpty(x, y)) {
            const move = {
              piece,
              moves: [ {
                x: x - 1,
                y: y + 1,
              } ],
              starting: {
                ...piece.position,
              },
              capturing: false,
            };
            this._branch(parent, move, depth, playerTurn);
          }
          if (this.board.isBottomRightEmpty(x, y)) {
            const move = {
              piece,
              moves: [ {
                x: x + 1,
                y: y + 1,
              } ],
              starting: {
                ...piece.position,
              },
              capturing: false,
            };
            this._branch(parent, move, depth, playerTurn);
          }
        }

        if (this.board.isTopLeftEmpty(x, y)) {
          const move = {
            piece,
            moves: [ {
              x: x - 1,
              y: y - 1,
            } ],
            starting: {
              ...piece.position,
            },
            capturing: false,
          };
          this._branch(parent, move, depth, playerTurn);
        }
        if (this.board.isTopRightEmpty(x, y)) {
          const move = {
            piece,
            moves: [ {
              x: x + 1,
              y: y - 1,
            } ],
            starting: {
              ...piece.position,
            },
            capturing: false,
          };
          this._branch(parent, move, depth, playerTurn);
        }
      }

    } else {
      for (const piece of this.checkers.aiPieces) {
        const { x, y, } = piece.position;
        if (piece.king) {
          if (this.board.isTopLeftEmpty(x, y)) {
            const move = {
              piece,
              moves: [ {
                x: x - 1,
                y: y - 1,
              } ],
              starting: {
                ...piece.position,
              },
              capturing: false,
            };
            this._branch(parent, move, depth, playerTurn);
          }
          if (this.board.isTopRightEmpty(x, y)) {
            const move = {
              piece,
              moves: [ {
                x: x + 1,
                y: y - 1,
              } ],
              starting: {
                ...piece.position,
              },
              capturing: false,
            };
            this._branch(parent, move, depth, playerTurn);
          }
        }

        if (this.board.isBottomLeftEmpty(x, y)) {
          const move = {
            piece,
            moves: [ {
              x: x - 1,
              y: y + 1,
            } ],
            starting: {
              ...piece.position,
            },
            capturing: false,
          };
          this._branch(parent, move, depth, playerTurn);
        }
        if (this.board.isBottomRightEmpty(x, y)) {
          const move = {
            piece,
            moves: [ {
              x: x + 1,
              y: y + 1,
            } ],
            starting: {
              ...piece.position,
            },
            capturing: false,
          };
          this._branch(parent, move, depth, playerTurn);
        }
      }
    }

    if (parent.children.length === 0)
      this._setLeafNode(parent);
  }

  private minimax(
    parent: TreeNode,
    alpha: number, beta: number,
    maxPlayer: boolean
  ): number {
    if (parent.children.length === 0) {
      return parent.heuristic;
    }

    // AI
    let val = 0;
    if (maxPlayer) {
      val = -Infinity;
      for (const child of parent.children) {
        val = Math.max(val, this.minimax(child, alpha, beta, false));
        if (val >= beta) break;
        alpha = Math.max(alpha, val);
      }
    } else { // Player
      val = Infinity;
      for (const child of parent.children) {
        val = Math.min(val, this.minimax(child, alpha, beta, true));
        if (val <= alpha) break;
        beta = Math.max(beta, val);
      }
    }
    return val;
  }

  move() {
    // Check for moves
    const rootMoves = this.getAllPossibleMoves();

    if (rootMoves.length === 1) {
      this._move(rootMoves[0]);
      this.checkers.tempCaptured.splice(0);
      return;
    }

    // Minimax for rootMoves
    let bestMove: Move = rootMoves[0];
    let heuristic = 0;
    let max = -Infinity;

    for (const moves of rootMoves) {
      this._move(moves);
      const promoted = this.checkers.promoted;
      this.checkers.promoted = false;

      const root = new TreeNode();
      this.branchSearchTree(root, MAX_DEPTH, true);
      heuristic = this.minimax(root, -Infinity, Infinity, false);
      if (heuristic > max) {
        max = heuristic;
        bestMove = moves;
      }

      this.checkers.promoted = promoted;
      this._reverseMove(moves);
    }

    this._move(bestMove);
    this.checkers.tempCaptured.splice(0);
    this.transpositionTable = {};
    // console.log(this.heuristicMemo);
    // console.log('Best Move Eval', max);
    // console.log('Current Eval', this.heuristic.getHeuristic());
  }
}

export default AI;
