class Node {
    children = [];
    heuristic = 0;
}

let root;
let memo = {};

function getSingleCapture(x, y, king) {
    if (isCaptureBottomLeft(x, y, 1)) {
        return { x: x - 2, y: y + 2 };
    }

    if (isCaptureBottomRight(x, y, 1)) {
        return { x: x + 2, y: y + 2 };
    }

    if (king) {
        if (isCaptureTopLeft(x, y, 1)) {
            return { x: x - 2, y: y - 2 };
        }

        if (isCaptureTopRight(x, y, 1)) {
            return { x: x + 2, y: y - 2 };
        }
    }

    return null;
}

function movePiece({ piece, x, y }) {
    const { position } = piece;
    let changed = false; 

    grid.setCell(position.x, position.y, null);
    piece.setPosition(x, y);
    if (!piece.king) {
        if (piece.player) {
            if (y === 0) {
                piece.king = true;
                changed = true;
                playerKings++;
            }
        } else {
            if (y === 7) {
                piece.king = true;
                changed = true;
                aiKings++;
            }
        }
    }      
    grid.setCell(x, y, piece);

    return changed;
}

function reverseMovePiece(piece, x, y, changed) {
    const { position } = piece;

    grid.setCell(position.x, position.y, null);
    if (changed) {
        piece.king = false;
        if (piece.player)   playerKings--;
        else                aiKings--;
    }
    piece.setPosition(x, y);
    grid.setCell(x, y, piece);
}

const tempCaptures = [];
function capturePiece({ piece, x, y }) {
    const { position } = piece;
    let changed = false;

    grid.setCell(position.x, position.y, null);

    const capX = (position.x + x) / 2;
    const capY = (position.y + y) / 2;
    const captured = grid.getCell(capX, capY);
    tempCaptures.push(captured);
    if (captured.player) {
        playerPieces.splice(playerPieces.indexOf(captured), 1);
    } else {
        aiPieces.splice(aiPieces.indexOf(captured), 1);
    }
    grid.setCell(capX, capY, null);

    piece.setPosition(x, y);
    if (!piece.king) {
        if (piece.player) {
            if (y === 0) {
                piece.king = true;
                changed = true;
                playerKings++;
            }
        } else {
            if (y === 7) {
                piece.king = true;
                changed = true;
                aiKings++;
            }
        }
    }                
    grid.setCell(x, y, piece);

    return changed;
}

function reverseCapturePiece(piece, x, y, changed) {
    const { position } = piece;

    grid.setCell(position.x, position.y, null);

    const capX = (position.x + x) / 2;
    const capY = (position.y + y) / 2;
    const uncaptured = tempCaptures.splice(tempCaptures.length - 1, 1)[0]
    if (uncaptured.player) {
        playerPieces.push(uncaptured);
    } else {
        aiPieces.push(uncaptured);
    }
    grid.setCell(capX, capY, uncaptured);

    piece.setPosition(x, y);
    if (changed) {
        piece.king = false;
        if (piece.player)   playerKings--;
        else                aiKings--;
    }
    grid.setCell(x, y, piece);
}

// TODO: Add more to this
// Number of player/ai pieces
// Number of king pieces
function getHeuristic() {
    if (aiPieces.length === 0) {
        return -100;
    }

    if (playerPieces.length === 0) {
        return 100;
    }

    let score = aiPieces.length - playerPieces.length // piece heuristic
        + (aiKings - playerKings) * 4 // king heuristic

    // TODO: Add more heuristic values here

    return score;
}

function branchTree(parent, depth) {
    if (depth > MAX_DEPTH) return;

    if (depth & 1) { // Player Moves
        if (playerPieces.length == 0) return;

        const capturePieces = getAvailableCapturePieces(playerPieces, 1);

        if (capturePieces.length > 0) {
            for (const piece of capturePieces) {
                explorePlayerCaptures(parent, piece, depth);
            }
        } else {
            for (const piece of playerPieces) {
                explorePlayerMovements(parent, piece, depth);
            }
        }
    } else { // AI Moves
        if (aiPieces.length == 0) return;

        const capturePieces = getAvailableCapturePieces(aiPieces, 0);
        
        if (capturePieces.length > 0) {
            for (const piece of capturePieces) {
                exploreAICaptures(parent, piece, depth);
            }
        } else {
            for (const piece of aiPieces) {
                exploreAIMovements(parent, piece, depth);
            }
        }
    }
}

function createNode(parent, depth, moves) {
    // let node = memo[grid.getState()];
    // if (node) {
    //     parent.children.push({ node, moves });
    //     return;
    // }

    node = new Node();
    node.heuristic = getHeuristic();
    parent.children.push({ node, moves });

    branchTree(node, depth + 1);
}

function exploreAICaptures(parent, piece, depth, moves = []) {
    const { x, y } = piece.position;
    let capture = false;

    if (isCaptureBottomLeft(x, y, 1)) {
        capture = true;
        const move = { piece,
            x: x - 2,
            y: y + 2,
        }
        const changed = capturePiece(move);
        moves.push(move);
        if (!exploreAICaptures(parent, piece, depth, moves)) {
            createNode(parent, depth, [ ...moves ]);
        }
        moves.pop();
        reverseCapturePiece(piece, x, y, changed);
    }

    if (isCaptureBottomRight(x, y, 1)) {
        capture = true;
        const move = { piece,
            x: x + 2,
            y: y + 2,
        }
        const changed = capturePiece(move);
        moves.push(move);
        if (!exploreAICaptures(parent, piece, depth, moves)) {
            createNode(parent, depth, [ ...moves ]);
        }
        moves.pop();
        reverseCapturePiece(piece, x, y, changed);
    }

    if (piece.king) {
        if (isCaptureTopLeft(x, y, 1)) {
            capture = true;
            const move = { piece,
                x: x - 2,
                y: y - 2,
            }
            const changed = capturePiece(move);
            moves.push(move);
            if (!exploreAICaptures(parent, piece, depth, moves)) {
                createNode(parent, depth, [ ...moves ]);
            }
            moves.pop();
            reverseCapturePiece(piece, x, y, changed);
        }
    
        if (isCaptureTopRight(x, y, 1)) {
            capture = true;
            const move = { piece,
                x: x + 2,
                y: y - 2,
            }
            const changed = capturePiece(move);
            moves.push(move);
            if (!exploreAICaptures(parent, piece, depth, moves)) {
                createNode(parent, depth, [ ...moves ]);
            }
            moves.pop();
            reverseCapturePiece(piece, x, y, changed);
        }
    }

    return capture;
}

function explorePlayerCaptures(parent, piece, depth, moves = []) {
    const { x, y } = piece.position;
    let capture = false;

    if (isCaptureTopLeft(x, y, 0)) {
        capture = true;
        const move = { piece,
            x: x - 2,
            y: y - 2,
        }
        const changed = capturePiece(move);
        moves.push(move);
        if (!exploreAICaptures(parent, piece, depth, moves)) {
            createNode(parent, depth, [ ...moves ]);
        }
        moves.pop();
        reverseCapturePiece(piece, x, y, changed);
    }

    if (isCaptureTopRight(x, y, 0)) {
        capture = true;
        const move = { piece,
            x: x + 2,
            y: y - 2,
        }
        const changed = capturePiece(move);
        moves.push(move);
        if (!exploreAICaptures(parent, piece, depth, moves)) {
            createNode(parent, depth, [ ...moves ]);
        }
        moves.pop();
        reverseCapturePiece(piece, x, y, changed);
    }

    if (piece.king) {
        if (isCaptureBottomLeft(x, y, 0)) {
            capture = true;
            const move = { piece,
                x: x - 2,
                y: y + 2,
            }
            const changed = capturePiece(move);
            moves.push(move);
            if (!exploreAICaptures(parent, piece, depth, moves)) {
                createNode(parent, depth, [ ...moves ]);
            }
            moves.pop();
            reverseCapturePiece(piece, x, y, changed);
        }
    
        if (isCaptureBottomRight(x, y, 0)) {
            capture = true;
            const move = { piece,
                x: x + 2,
                y: y + 2,
            }
            const changed = capturePiece(move);
            moves.push(move);
            if (!exploreAICaptures(parent, piece, depth, moves)) {
                createNode(parent, depth, [ ...moves ]);
            }
            moves.pop();
            reverseCapturePiece(piece, x, y, changed);
        }
    }

    return capture;
}

function exploreAIMovements(parent, piece, depth) {
    const { x, y } = piece.position;

    // Check for bottom movements
    if (isBottomLeftEmpty(x, y)) {
        // Update the board
        const move = { piece,
            x: x - 1,
            y: y + 1
        };
        const changed = movePiece(move);
        createNode(parent, depth, [ move ]);
        reverseMovePiece(piece, x, y, changed);
    }

    if (isBottomRightEmpty(x, y)) {
        const move = { piece,
            x: x + 1,
            y: y + 1
        };
        const changed = movePiece(move);
        createNode(parent, depth, [ move ]);
        reverseMovePiece(piece, x, y, changed);
    }

    if (piece.king) {
        if (isTopLeftEmpty(x, y)) {
            const move = { piece,
                x: x - 1,
                y: y - 1
            };
            const changed = movePiece(move);
            createNode(parent, depth, [ move ]);
            reverseMovePiece(piece, x, y, changed);
        }

        if (isTopRightEmpty(x, y)) {
            const move = { piece,
                x: x + 1,
                y: y - 1
            };
            const changed = movePiece(move);
            createNode(parent, depth, [ move ]);
            reverseMovePiece(piece, x, y, changed);
        }
    }
}

function explorePlayerMovements(parent, piece, depth) {
    const { x, y } = piece.position;

    // Check for bottom movements
    if (isTopLeftEmpty(x, y)) {
        // Update the board
        const move = { piece,
            x: x - 1,
            y: y - 1
        };
        const changed = movePiece(move);
        createNode(parent, depth, [ move ]);
        reverseMovePiece(piece, x, y, changed);
    }

    if (isTopRightEmpty(x, y)) {
        const move = { piece,
            x: x + 1,
            y: y - 1
        };
        const changed = movePiece(move);
        createNode(parent, depth, [ move ]);
        reverseMovePiece(piece, x, y, changed);
    }

    if (piece.king) {
        if (isBottomLeftEmpty(x, y)) {
            const move = { piece,
                x: x - 1,
                y: y + 1
            };
            const changed = movePiece(move);
            createNode(parent, depth, [ move ]);
            reverseMovePiece(piece, x, y, changed);
        }

        if (isBottomRightEmpty(x, y)) {
            const move = { piece,
                x: x + 1,
                y: y + 1
            };
            const changed = movePiece(move);
            createNode(parent, depth, [ move ]);
            reverseMovePiece(piece, x, y, changed);
        }
    }
}

function createTree(root, depth = 0) {
    branchTree(root, depth);
    tempCaptures.splice(0);
}

function minimax(parent, alpha, beta, turn) {
    if (parent.children.length === 0) {
        return parent.heuristic;
    }

    let eval;

    if (turn) { // Player Turn Min
        let min = Infinity;
        for (const { node } of parent.children) {
            eval = minimax(node, alpha, beta, 0);
            min = Math.min(min, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) break;        
        }
        return min;
    } else { // AI Turn Max
        let max = -Infinity;
        for (const { node } of parent.children) {
            eval = minimax(node, alpha, beta, 1);
            max = Math.max(max, eval);
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) break;        
        }
        return max;
    }
}

function thinkAI() {
    root = new Node();

    // Check if the ai can capture
    capturePieces = getAvailableCapturePieces(aiPieces, turn);
    if (capturePieces.length > 0) {
        createTree(root, MAX_DEPTH);

        if (root.children.length === 1) {
            // Force move, don't let the ai think
            const { moves } = root.children[0];
            for (const move of moves) {
                capturePiece(move);
            }
    
            turn = 1;
            return;
        }
    }

    createTree(root);
    // Find the best move
    let bestMoves, eval, max = -Infinity;
    for (const { node, moves } of root.children) {
        eval = minimax(node, -Infinity, Infinity, 1);
        if (eval > max) {
            max = eval;
            bestMoves = moves;
        }
    }
    delete root;

    // Move
    for (const move of bestMoves) {
        const { piece, x } = move;
        if (Math.abs(piece.position.x - x) === 1) {
            movePiece(move);
        } else {
            capturePiece(move);
        }
    }

    memo = {};
    turn = 1;
}