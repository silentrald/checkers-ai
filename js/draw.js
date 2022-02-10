function draw(graphic) {
    graphic.beginFill(0x000000);
    graphic.drawRect(0, 0, WIDTH, HEIGHT);

    graphic.beginFill(0xFF0000);
    for (let r = 0; r < 8; r++) {
        for (let c = r & 1; c < 8; c += 2) {
            graphic.drawRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
    
    graphic.beginFill(0xFFFFFF);
    for (const piece of aiPieces) {
        graphic.lineStyle(4 * piece.king, 0x0000FF);
        graphic.drawShape(piece);
    }
    graphic.beginFill(0xAAAAAA);
    for (const piece of playerPieces) {
        graphic.lineStyle(4 * piece.king, 0x0000FF);
        graphic.drawShape(piece);
    }
    graphic.lineStyle(0, 0xFFFFFF);
    graphic.endFill();
}

function drawHighlights(graphic) {
    graphic.lineStyle(4, 0xFFFFFF);
    graphic.beginFill(0x00000000);
    for (const highlight of highlights) {
        graphic.drawShape(highlight);
    }
    graphic.endFill();
    graphic.lineStyle(0, 0xFFFFFF);
}