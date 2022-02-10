class CheckerPiece extends PIXI.Circle {
    king = false;

    constructor(x, y, player) {
        super(
            x * TILE_SIZE + HALF_TILE_SIZE,
            y * TILE_SIZE + HALF_TILE_SIZE,
            HALF_TILE_SIZE - 4
        );
        this.position = { x, y };
        this.player = player;
    }

    setX(x) {
        this.x = x * TILE_SIZE + HALF_TILE_SIZE;
        this.position.x = x;
    }

    setY(y) {
        this.y = y * TILE_SIZE + HALF_TILE_SIZE;
        this.position.y = y;
    }

    setPosition(x, y) {
        this.setX(x);
        this.setY(y);
    }
}