import { defineStore } from 'pinia';
import { createTile, rotateGrid, executeMove, addRandomTile, isGameOver } from '../gameLogic';

// 儲存整個遊戲狀態到 Chrome Storage
const saveGameStateToStorage = (state) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        // --- 核心修復：使用 toRaw 確保 tiles 是一個純淨的 JS 陣列 ---
        const gridData = [];
        state.tiles.forEach(tile => {
            gridData.push({
                r: tile.row,
                c: tile.col,
                value: tile.value
            })
        })

        // 只儲存遊戲運行所需的狀態
        const dataToSave = {
            grid: gridData, // 使用 tiles 列表
            score: state.score,
            canUndoTimes: state.canUndoTimes,
            won: state.won,
            isGameOver: state.isGameOver,
        };
        chrome.storage.local.set({ gameState: dataToSave });
    }
};

// 從 Chrome Storage 載入整個遊戲狀態
const loadGameStateFromStorage = () => {
    return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            // 請求 gameState 和 bestScore
            chrome.storage.local.get(['gameState', 'bestScore'], (result) => {
                resolve({
                    gameState: result.gameState,
                    bestScore: result.bestScore || 0,
                    previousState: null
                });
            });
        } else {
            // 非擴充功能環境的備用/初始狀態
            resolve({ gameState: null, bestScore: 0 });
        }
    });
};

// 定義 Pinia Store
export const useGameStore = defineStore('game', {
    // === 狀態 (State) ===
    state: () => ({
        // 初始狀態應為空，等待非同步載入
        tiles: [],
        awardTile: 32,
        canUndoTimes: 3,
        score: 0,
        bestScore: 0, // 初始設為 0，等待載入
        previousState: null,
        isGameOver: false,
        won: false,
        initialized: false, // 新增：追蹤狀態是否已從 storage 載入
    }),

    // === 計算屬性 (Getters) ===
    getters: {
        canUndo(state) {
            return state.previousState !== null && state.canUndoTimes > 0;
        }
    },

    // === 方法 (Actions) ===
    actions: {

        // 核心改變：處理狀態儲存
        updateGameState(newTiles, newScore, moved, won, isGameOver) {
            this.tiles = newTiles;
            this.score = newScore;
            this.won = won;
            this.isGameOver = isGameOver;

            // 1. 遊戲狀態發生變化後，非同步儲存
            if (moved) {
                // 儲存當前狀態
                saveGameStateToStorage(this);
            }

            // 2. 最佳分數更新邏輯：
            if (newScore > this.bestScore) {
                this.bestScore = newScore;

                // 確保同時將新的最佳分數儲存到 chrome.storage
                if (typeof chrome !== 'undefined' && chrome.storage) {
                    chrome.storage.local.set({ bestScore: newScore });
                }
            }
        },

        // 新增 Action：載入遊戲狀態
        async loadGame() {
            const { gameState, bestScore } = await loadGameStateFromStorage();

            this.bestScore = bestScore; // 載入最佳分數
            this.canUndoTimes = gameState?.canUndoTimes || 3; // 載入可撤銷次數，預設為 3
            this.initialized = true;

            if (gameState && Array.isArray(gameState.grid)) {
                console.log("Found saved game state. Loading..."); // <--- 建議新增此行用於除錯

                // 載入上次的遊戲狀態
                gameState.grid.forEach(tileData => {
                    const newTile = createTile(tileData.r, tileData.c, tileData.value);
                    this.tiles.push(newTile);
                })

                this.score = gameState.score;
                this.won = gameState.won;
                this.isGameOver = gameState.isGameOver;
                this.previousState = gameState.previousState;

            } else {
                console.log("No valid saved game found. Starting new game."); // <--- 建議新增此行用於除錯
                // 如果沒有儲存的遊戲，則開始新遊戲
                this.newGame(false);
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
                if (this.canUndoTimes > 0) {
                    this.canUndoTimes -= 1;
                }
                saveGameStateToStorage(this);
            }
        },

        // 調整 newGame，使其可以在載入時被呼叫，且不會再次觸發載入
        newGame(isManual = true) {
            this.tiles = [];
            this.score = 0;
            this.isGameOver = false;
            this.won = false;
            this.previousState = null;
            this.addTile();
            this.addTile();

            // 只有手動開始新遊戲時才清空儲存（可選：讓使用者隨時能恢復舊遊戲）
            if (isManual) {
                // 清除儲存的狀態，因為已經開始新遊戲
                saveGameStateToStorage({ tiles: [], score: 0 });
            }
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
            const { newTiles, awardTile, canUndoTimes, newScore, moved, won } = executeMove(rotatedTiles, this.score, this.awardTile, this.canUndoTimes);
            this.awardTile = awardTile;
            this.canUndoTimes = canUndoTimes;

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

                this.tiles = finalTiles; // 更新 tiles 陣列
                this.score = newScore;
                this.won = won;
                this.addTile();

                const isGameReallyOver = !this.won && isGameOver(this.tiles);
                if (isGameReallyOver) {
                    this.isGameOver = true;
                }

                this.updateGameState(this.tiles, this.score, true, this.won, this.isGameOver);

            } else {
                this.previousState = null;
            }
        },
    }
});