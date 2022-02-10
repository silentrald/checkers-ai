function mousedown(e, graphic) {
    if (processing) return;

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

        if (Math.abs(currentPiece.position.x - x) > 1) {
            const capX = (currentPiece.position.x + x) / 2;
            const capY = (currentPiece.position.y + y) / 2;
            const captured = grid.getCell(capX, capY);
            if (captured.player) {
                playerPieces.splice(playerPieces.indexOf(captured), 1);
            } else {
                aiPieces.splice(aiPieces.indexOf(captured), 1);
            }

            grid.setCell(capX, capY, null);
            capturing = true;
        }

        currentPiece.setPosition(x, y);
        if ((currentPiece.player && y === 0) || (!currentPiece.player && y === 7)) {
            currentPiece.king = true;
        }
        
        grid.setCell(x, y, currentPiece);

        draw(graphic);

        // Check if the piece can still capture
        if (capturing) {
            if (currentPiece.player) {
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
            } else {
                if (isCaptureBottomLeft(x, y, 1)) {
                    addHighlight(x - 2, y + 2);
                }

                if (isCaptureBottomRight(x, y, 1)) {
                    addHighlight(x + 2, y + 2);
                }


                if (currentPiece.king) {
                    if (isCaptureTopLeft(x, y, 1)) {
                        addHighlight(x - 2, y - 2);
                    }
        
                    if (isCaptureTopRight(x, y, 1)) {
                        addHighlight(x + 2, y - 2);
                    }
                }
            }

            if (highlights.length > 0) {
                drawHighlights(graphic);
                processing = false;
                return;
            }

            capturing = false;
        }
        
        turn = (turn + 1) & 1;
        capturePieces = getAvailableCapturePieces(turn);
        
        if (aiPieces.length === 0) {
            alert('Player 2 Wins');
            return;
        } else if (playerPieces.length === 0) {
            alert('Player 1 Wins');
            return;
        }

        currentPiece = null;
        processing = false;
        return;
    }

    if (capturing || piece.player !== turn) {
        return;
    }

    if (capturePieces.length > 0) {
        if (capturePieces.indexOf(piece) === -1) {
            return;
        }

        currentPiece = piece;
        clearHighlights();

        if (piece.player) {
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
            if (isCaptureBottomLeft(x, y, 1)) {
                addHighlight(x - 2, y + 2);
            }

            if (isCaptureBottomRight(x, y, 1)) {
                addHighlight(x + 2, y + 2);
            }

            if (piece.king) {
                if (isCaptureTopLeft(x, y, 1)) {
                    addHighlight(x - 2, y - 2);
                }

                if (isCaptureTopRight(x, y, 1)) {
                    addHighlight(x + 2, y - 2);
                }
            }
        }
    } else {
        currentPiece = piece;
        clearHighlights();
        if (piece.player) {
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
        } else {
            // Player on top
            if (isBottomLeftEmpty(x, y)) {
                addHighlight(x - 1, y + 1);
            }

            if (isBottomRightEmpty(x, y)) {
                addHighlight(x + 1, y + 1);
            }

            if (piece.king) {
                if (isTopLeftEmpty(x, y)) {
                    addHighlight(x - 1, y - 1);
                }

                if (isTopRightEmpty(x, y)) {
                    addHighlight(x + 1, y - 1);
                }
            }
        }
    }

    // Redraw
    draw(graphic);
    drawHighlights(graphic);
}