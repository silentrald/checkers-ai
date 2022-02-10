class Highlight extends PIXI.Circle {
    constructor(x, y) {
        super(
            x * TILE_SIZE + HALF_TILE_SIZE,
            y * TILE_SIZE + HALF_TILE_SIZE,
            HALF_TILE_SIZE - 4
        );
        this.position = { x, y };
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