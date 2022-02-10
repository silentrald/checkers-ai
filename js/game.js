window.onload = () => {
    // Setup
    for (let i = 0; i < 12; i++) {
        const x = i % 4 * 2;
        const y = Math.floor(i / 4);
    
        const px0 = x + (y & 1 ^ 1);
        const py0 = y;
        let piece = new CheckerPiece(px0, py0, 0);
        aiPieces.push(piece);
        grid.setCell(px0, py0, piece);
    
        const px1 = x + (y & 1);
        const py1 = 7 - y;
        piece = new CheckerPiece(px1, py1, 1);
        playerPieces.push(piece);
        grid.setCell(px1, py1, piece);
    }

    const app = new PIXI.Application({ width: WIDTH, height: HEIGHT });
    document.body.appendChild(app.view);

    const graphic = new PIXI.Graphics();
    app.stage.addChild(graphic);
    
    draw(graphic);
    graphic.interactive = true;

    graphic.on('mousedown', (e) => {
        mousedown(e, graphic);
    });

    capturePieces = getAvailableCapturePieces(
        turn ? playerPieces : aiPieces,
        turn
    );

    if (!turn) {
        thinkAI();
        draw(graphic);
    }
}

function addHighlight(x, y) {
    const highlight = new Highlight(x, y);
    highlights.push(highlight);
    grid.setCell(x, y, highlight);
}

function clearHighlights() {
    for (const highlight of highlights) {
        grid.setCell(
            highlight.position.x,
            highlight.position.y,
            null
        );
    }
    highlights.splice(0);
}

function getAvailableCapturePieces(pieces, player) {
    const capturePieces = [];

    if (player) {
        // Player on bottom
        for (const piece of pieces) {
            const { x, y } = piece.position;

            if (piece.king) {
                if (isCaptureTopLeft(x, y, 0) ||
                    isCaptureTopRight(x, y, 0) ||
                    isCaptureBottomLeft(x, y, 0) ||
                    isCaptureBottomRight(x, y, 0)
                ) {
                    capturePieces.push(piece);
                }
            } else if (isCaptureTopLeft(x, y, 0) || isCaptureTopRight(x, y, 0)) {
                capturePieces.push(piece);
            }
        }
    } else {
        // Player on top
        for (const piece of pieces) {
            const { x, y } = piece.position;

            if (piece.king) {
                if (isCaptureTopLeft(x, y, 1) ||
                    isCaptureTopRight(x, y, 1) ||
                    isCaptureBottomLeft(x, y, 1) ||
                    isCaptureBottomRight(x, y, 1)
                ) {
                    capturePieces.push(piece);
                }
            } else if (isCaptureBottomLeft(x, y, 1) || isCaptureBottomRight(x, y, 1)) {
                capturePieces.push(piece);
            }
        }
    }

    return capturePieces;
}
