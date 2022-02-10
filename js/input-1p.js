function mousedown(e, graphic) {
    if (processing || turn === 0) {
        return;
    }

    const x = Math.floor(e.data.global.x / TILE_SIZE);
    const y = Math.floor(e.data.global.y / TILE_SIZE);
    const piece = grid.getCell(x, y);

    // Check if there is a piece there
    if (!piece) {
        return;
    }

    if (piece instanceof Highlight) {
        processing = true;
        clearHighlights();
        
        grid.setCell(
            currentPiece.position.x,
            currentPiece.position.y,
            null
        );

        if (Math.abs(currentPiece.position.x - x) === 2) {
            const capX = (currentPiece.position.x + x) / 2;
            const capY = (currentPiece.position.y + y) / 2;
            const captured = grid.getCell(capX, capY);
            aiPieces.splice(aiPieces.indexOf(captured), 1);

            grid.setCell(capX, capY, null);
            capturing = true;
        }

        currentPiece.setPosition(x, y);
        if (y === 0) {
            currentPiece.king = true;
        }
        
        grid.setCell(x, y, currentPiece);

        draw(graphic);

        // Check if the piece can still capture
        if (capturing) {
            if (isCaptureTopLeft(x, y, 0)) {
                addHighlight(x - 2, y - 2);
            }

            if (isCaptureTopRight(x, y, 0)) {
                addHighlight(x + 2, y - 2);
            }

            if (currentPiece.king) {
                if (isCaptureBottomLeft(x, y, 0)) {
                    addHighlight(x - 2, y + 2);
                }
    
                if (isCaptureBottomRight(x, y, 0)) {
                    addHighlight(x + 2, y + 2);
                }
            }

            if (highlights.length > 0) {
                drawHighlights(graphic);
                processing = false;
                return;
            }

            capturing = false;
        }
        
        turn = 0;
        
        if (aiPieces.length === 0) {
            alert('Player Wins');
            return;
        }

        currentPiece = null;
        thinkAI();
        capturePieces = getAvailableCapturePieces(playerPieces, turn);
        draw(graphic);
        processing = false;

        console.log('Player Turn');
        // console.log('player', playerPieces);
        // console.log('captures', capturePieces);
        // console.log('ai', aiPieces);
        return;
    }

    if (capturing || piece.player !== 1) {
        return;
    }

    if (capturePieces.length > 0) {
        if (capturePieces.indexOf(piece) === -1) {
            return;
        }

        currentPiece = piece;
        clearHighlights();

        if (isCaptureTopLeft(x, y, 0)) {
            addHighlight(x - 2, y - 2);
        }

        if (isCaptureTopRight(x, y, 0)) {
            addHighlight(x + 2, y - 2);
        }

        if (piece.king) {
            if (isCaptureBottomLeft(x, y, 0)) {
                addHighlight(x - 2, y + 2);
            }

            if (isCaptureBottomRight(x, y, 0)) {
                addHighlight(x + 2, y + 2);
            }
        }
    } else {
        currentPiece = piece;
        clearHighlights();

        // Player on the bottom
        if (isTopLeftEmpty(x, y)) {
            addHighlight(x - 1, y - 1);
        }

        if (isTopRightEmpty(x, y)) {
            addHighlight(x + 1, y - 1);
        }

        if (piece.king) {
            if (isBottomLeftEmpty(x, y)) {
                addHighlight(x - 1, y + 1);
            }

            if (isBottomRightEmpty(x, y)) {
                addHighlight(x + 1, y + 1);
            }
        }
    }

    // Redraw
    draw(graphic);
    drawHighlights(graphic);
}