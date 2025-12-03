import { createTile, rotateGrid } from '../src/gameLogic';
import { describe, it, expect } from 'vitest';

describe('gameLogic', () => {
    it('creates a tile with unique id', () => {
        const tile1 = createTile(0, 0, 2);
        const tile2 = createTile(1, 1, 4);
        expect(tile1.id).not.toBe(tile2.id);
        expect(tile1.value).toBe(2);
        expect(tile2.value).toBe(4);
    });

    it('rotates grid correctly', () => {
        const grid = [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16]
        ];
        const rotated = rotateGrid(grid, 1);
        expect(rotated[0][0]).toBe(13);
        expect(rotated[3][3]).toBe(4);
    });
});
