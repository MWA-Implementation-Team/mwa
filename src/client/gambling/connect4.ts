export type C4Player = 'x' | 'o';

export type C4Cell = C4Player | '.';

export const c4Width = 7;
export const c4Height = 6;

export class Connect4Board {
    // 0,0: bottom left of board
    #cells: C4Cell[];

    constructor(cells: C4Cell[] = Array(c4Width * c4Height).fill('.')) {
        if (cells.length !== c4Width * c4Height) {
            throw new Error(`Expected ${c4Width * c4Height} cells`);
        }
        for (const cell of cells) {
            if (cell !== 'x' && cell !== 'o' && cell !== '.') {
                throw new Error(`Cells must consist of x, o and . chars`);
            }
        }
        this.#cells = cells;

        for (let x = 0; x < c4Width; x++) {
            let foundEmpty = false;
            for (let y = 0; y < c4Height; y++) {
                const cell = this.get(x, y);
                if (cell === '.') {
                    foundEmpty = true;
                } else if (foundEmpty) {
                    throw new Error('Floating cells detected');
                }
            }
        }
    }

    static fromString(str: string) {
        const lines = str.trim().split('\n');
        if (lines.length !== c4Height) {
            throw new Error(`Must be ${c4Width} lines`);
        }

        let cells: C4Cell[] = [];
        for (let i = lines.length - 1; i >= 0; i--) {
            const trimmedLine = lines[i].trim();
            if (trimmedLine.length !== c4Width) {
                throw new Error(`Line must be ${c4Width} chars: '${trimmedLine}'`);
            }
            for (const c of trimmedLine) {
                cells.push(c as C4Cell);
            }
        }
        return new Connect4Board(cells);
    }

    get(x: number, y: number): C4Cell {
        return this.#cells[this.#idx(x, y)];
    }

    set(x: number, y: number, cell: C4Cell) {
        this.#cells[this.#idx(x, y)] = cell;
    }

    place(x: number, player: C4Player): boolean {
        for (let y = 0; y < c4Height; y++) {
            if (this.get(x, y) === '.') {
                this.set(x, y, player);
                return true;
            }
        }
        return false;
    }

    isValidPos(x: number, y: number): boolean {
        return x >= 0 && x < c4Width && y >= 0 && y < c4Height;
    }

    #idx(x: number, y: number): number {
        if (!this.isValidPos(x, y)) {
            throw new Error(`Invalid connect 4 coords (${x}; ${y})`);
        }
        return x + c4Width * y;
    }

    asString(): string {
        let out = '';
        for (let y = c4Height - 1; y >= 0; y--) {
            if (y !== c4Height - 1) {
                out += '\n';
            }
            let line = '';
            for (let x = 0; x < c4Width; x++) {
                line += this.get(x, y);
            }
            out += line;
        }
        return out;
    }

    isFull(): boolean {
        return !this.#cells.includes('.');
    }

    winner(): C4Player | null {
        let player: C4Player | null = null;
        let streak = 0;

        function reset() {
            player = null;
            streak = 0;
        }

        function consume(cell: C4Cell): boolean {
            if (cell === '.') {
                reset();
                return false;
            }

            if (cell !== player) {
                reset();
                player = cell;
            }

            return ++streak >= 4;
        }

        for (let x = 0; x < c4Width; x++) {
            for (let y = 0; y < c4Height; y++) {
                if (consume(this.get(x, y))) {
                    return player;
                }
            }
            reset();
        }

        for (let y = 0; y < c4Height; y++) {
            for (let x = 0; x < c4Width; x++) {
                if (consume(this.get(x, y))) {
                    return player;
                }
            }
            reset();
        }

        const board = this;

        function checkDiagonal(startX: number, startY: number, dx: number, dy: number): boolean {
            let x = startX;
            let y = startY;
            while (board.isValidPos(x, y)) {
                if (consume(board.get(x, y))) {
                    return true;
                }
                x += dx;
                y += dy;
            }
            reset();
            return false;
        }

        for (let yStart = c4Height - 1; yStart >= 0; yStart--) {
            if (checkDiagonal(0, yStart, 1, 1)) {
                return player;
            }
            if (checkDiagonal(c4Width - 1, yStart, -1, 1)) {
                return player;
            }
        }

        for (let xStart = 0; xStart < c4Width; xStart++) {
            if (checkDiagonal(xStart, 0, 1, 1)) {
                return player;
            }
            if (checkDiagonal(xStart, 0, -1, 1)) {
                return player;
            }
        }
        return null;
    }
}

