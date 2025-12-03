import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../src/store/gameStore';

describe('gameStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('initializes with default state', () => {
        const store = useGameStore();
        expect(store.score).toBe(0);
        expect(store.tiles.length).toBeGreaterThan(0); // Should have initial tiles
        expect(store.isGameOver).toBe(false);
    });

    it('can start a new game', () => {
        const store = useGameStore();
        store.newGame();
        expect(store.score).toBe(0);
        expect(store.isGameOver).toBe(false);
        expect(store.tiles.length).toBeGreaterThan(0);
    });

    // Add more tests for moves, undo, win/loss, etc.
});
