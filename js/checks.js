function isBottomLeftEmpty(x, y) {
    return x > 0 && y < 7 && !grid.getCell(x - 1, y + 1);
}

function isBottomRightEmpty(x, y) {
    return x < 7 && y < 7 && !grid.getCell(x + 1, y + 1);
}

function isTopLeftEmpty(x, y) {
    return x > 0 && y > 0 && !grid.getCell(x - 1, y - 1);
}

function isTopRightEmpty(x, y) {
    return x < 7 && y > 0 && !grid.getCell(x + 1, y - 1);
}

function isCaptureBottomLeft(x, y, opponent) {
    if (x < 2 || y > 5) {
        return false;
    }

    const piece = grid.getCell(x - 1, y + 1);
    return piece instanceof CheckerPiece &&
        piece.player === opponent &&
        !grid.getCell(x - 2, y + 2);
}

function isCaptureBottomRight(x, y, opponent) {
    if (x > 5 || y > 5) {
        return false;
    }

    const piece = grid.getCell(x + 1, y + 1);
    return piece instanceof CheckerPiece &&
        piece.player === opponent &&
        !grid.getCell(x + 2, y + 2);
}

function isCaptureTopLeft(x, y, opponent) {
    if (x < 2 || y < 2) {
        return false;
    }

    const piece = grid.getCell(x - 1, y - 1);
    return piece instanceof CheckerPiece &&
        piece.player === opponent &&
        !grid.getCell(x - 2, y - 2);
}

function isCaptureTopRight(x, y, opponent) {
    if (x > 5 || y < 2) {
        return false;
    }

    const piece = grid.getCell(x + 1, y - 1);
    return piece instanceof CheckerPiece &&
        piece.player === opponent &&
        !grid.getCell(x + 2, y - 2);
}
