import { defineStore } from 'pinia';
import { rotateGrid, executeMove, addRandomTile, isGameOver, createTile } from '../gameLogic';

// 從 localStorage 載入/儲存分數的輔助函式 (保持不變)
const saveBestScoreToStorage = (score) => {
    if (typeof localStorage !== 'undefined') {
        const currentBest = parseInt(localStorage.getItem('bestScore') || '0', 10);
        if (score > currentBest) {
            localStorage.setItem('bestScore', score);
        }
    }
};

const loadBestScoreFromStorage = () => {
    if (typeof localStorage !== 'undefined') {
        return parseInt(localStorage.getItem('bestScore') || '0', 10);
    }
    return 0;
};

// 定義 Pinia Store
export const useGameStore = defineStore('game', {
    // === 狀態 (State) ===
    state: () => ({
        // 核心狀態：一維方塊物件列表
        tiles: [],
        score: 0,
        bestScore: loadBestScoreFromStorage(),
        previousState: null, // 用於 Undo
        isGameOver: false,
        won: false,
    }),

    // === 計算屬性 (Getters) ===
    getters: {
        // tiles getter 直接返回 state.tiles，因為它已經是一個物件列表
        // 這裡不再需要複雜的轉換。
        // tiles: (state) => state.tiles, 

        canUndo(state) {
            return state.previousState !== null;
        }
    },

    // === 方法 (Actions) ===
    actions: {
        updateScore(newScore) {
            this.score = newScore;
            saveBestScoreToStorage(newScore);
            if (newScore > this.bestScore) {
                this.bestScore = newScore;
            }
        },

        saveState() {
            this.previousState = {
                // 深度複製 tiles 列表，確保狀態分離
                tiles: JSON.parse(JSON.stringify(this.tiles)),
                score: this.score,
                won: this.won,
            };
        },

        undo() {
            if (this.previousState) {
                this.tiles = this.previousState.tiles;
                this.score = this.previousState.score;
                this.won = this.previousState.won;
                this.isGameOver = false;
                this.previousState = null;
            }
        },

        // 初始化/新遊戲
        newGame() {
            // 清空方塊
            this.tiles = [];
            this.score = 0;
            this.isGameOver = false;
            this.won = false;
            this.previousState = null;
            this.addTile();
            this.addTile();
        },

        // 在空白處添加一個隨機方塊
        addTile() {
            const { newTiles, added } = addRandomTile(this.tiles);
            if (added) {
                this.tiles = newTiles;
            }
        },

        // 執行方塊移動
        move(direction) {
            if (this.isGameOver) return;

            this.saveState();

            const rotations = { left: 0, down: 1, right: 2, up: 3 }[direction];

            // 1. 建立虛擬 4x4 網格，儲存方塊 ID，方便旋轉
            const tileMap = Array(4).fill(null).map(() => Array(4).fill(null));
            this.tiles.forEach(tile => {
                tileMap[tile.row][tile.col] = tile.id;
            });

            // 2. 旋轉虛擬網格
            const rotatedMap = rotateGrid(tileMap, rotations);

            // 3. 根據旋轉後的網格，重映射方塊的 row/col 到新的 (左移後的位置)
            let rotatedTiles = [];
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    const id = rotatedMap[r][c];
                    if (id !== null) {
                        // 找到原始方塊物件
                        const tile = this.tiles.find(t => t.id === id);
                        // 更新方塊的 row/col 屬性 (使其位於旋轉後的相對位置)
                        if (tile) {
                            rotatedTiles.push({
                                ...tile,
                                row: r, // 旋轉後的行
                                col: c  // 旋轉後的列
                            });
                        }
                    }
                }
            }


            // 4. 執行核心移動邏輯 (向左)
            const { newTiles, newScore, moved, won } = executeMove(rotatedTiles, this.score);

            // 5. 將結果網格旋轉回去
            if (moved) {

                // 創建一個新的 Map，以便反旋轉時能快速查找方塊物件
                const movedTileMap = Array(4).fill(null).map(() => Array(4).fill(null));
                newTiles.forEach(tile => {
                    movedTileMap[tile.row][tile.col] = tile;
                });

                // 旋轉回來
                const finalMap = rotateGrid(movedTileMap, 4 - rotations);

                // 重新收集最終的方塊列表，並更新它們的最終位置
                const finalTiles = [];
                finalMap.forEach((rowArr, r) => {
                    rowArr.forEach((tile, c) => {
                        if (tile !== null) {
                            finalTiles.push({
                                ...tile,
                                row: r, // 最終的行
                                col: c, // 最終的列
                            });
                        }
                    });
                });

                this.tiles = finalTiles;
                this.updateScore(newScore);

                if (won && !this.won) {
                    this.won = true;
                    this.isGameOver = true;
                }

                this.addTile();

                if (!this.won && isGameOver(this.tiles)) {
                    this.isGameOver = true;
                }
            } else {
                this.previousState = null;
            }
        },
    }
});