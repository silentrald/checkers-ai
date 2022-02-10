class Grid {
    state = {
        left: 0,
        right: 0,
    };
    matrix = [];
    
    constructor() {
        const matrix = []
        for (let x = 0; x < 8; x++) {
            matrix.push([]);
            for (let y = 0; y < 8; y++) {
                matrix[x].push(null);
            }
        }
        this.matrix = matrix;
    }

    setCell(x, y, val) {
        this.matrix[x][y] = val;

        let cell = -1;
        if (val instanceof CheckerPiece) {
            cell = val.player;
        } else if (val instanceof Highlight) {
            cell = 0x3;
        } else { // null
            cell = 0x0;
        }

        let offset = (y * 4 + Math.floor(x / 2)) * 2;
        let ref = 'right';
        if (offset > 31) {
            offset -= 32;
            ref = 'left';
        }

        this.state[ref] = ((this.state[ref] & ~(0x3 << offset)) | (cell << offset)) >>> 0;
    }

    getCell(x, y) {
        return this.matrix[x][y];
    }

    getState() {
        return this.state.left.toString(16) + this.state.right.toString(16).padStart(8, '0');
    }
}