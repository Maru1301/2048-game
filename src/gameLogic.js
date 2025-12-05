// 全域唯一的 ID 計數器
let nextTileId = 0;

/**
 * 創建一個新的方塊物件
 * @param {number} r - 行
 * @param {number} c - 列
 * @param {number} value - 數值 (2 或 4)
 * @returns {object} - 新方塊物件
 */
export const createTile = (r, c, value) => {
    // 確保每個新方塊都有唯一的 ID，這是動畫的基礎
    const id = nextTileId++;
    return {
        id,
        value,
        row: r,
        col: c,
        isNew: true, // 標記為新，用於進入動畫
        merged: false, // 標記是否為合併後的結果
    };
};

// 網格旋轉函式 (保持不變，但現在處理的是虛擬網格的索引)
export const rotateGrid = (g, times) => {
    let result = g.map(row => [...row]);
    for (let t = 0; t < times; t++) {
        const newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                newGrid[c][3 - r] = result[r][c];
            }
        }
        result = newGrid;
    }
    return result;
};

/**
 * 將稀疏的方塊列表轉換為 4x4 的密集網格 (用於旋轉和遊戲結束檢查)
 * @param {object[]} tiles - 方塊物件列表
 * @returns {number[][]} - 4x4 數字網格
 */
const tilesToGrid = (tiles) => {
    const grid = Array(4).fill(null).map(() => Array(4).fill(0));
    tiles.forEach(tile => {
        if (tile.value !== 0) {
            grid[tile.row][tile.col] = tile.value;
        }
    });
    return grid;
};

/**
 * 在網格中添加一個隨機數字 (2 或 4)
 * @param {object[]} currentTiles - 當前方塊列表
 * @returns {{newTiles: object[], added: boolean}} - 新的方塊列表
 */
export const addRandomTile = (currentTiles) => {
    const grid = tilesToGrid(currentTiles);
    const emptyCells = [];

    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === 0) {
                emptyCells.push({ r, c });
            }
        }
    }

    if (emptyCells.length > 0) {
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newValue = Math.random() < 0.9 ? 2 : 4;

        const newTile = createTile(r, c, newValue);
        // 使用 concat 確保 Pinia 狀態是不可變更新
        return { newTiles: currentTiles.concat(newTile), added: true };
    }
    return { newTiles: currentTiles, added: false };
};

// 檢查遊戲是否結束
export const isGameOver = (tiles) => {
    const grid = tilesToGrid(tiles);
    // 檢查是否有空位
    if (grid.some(row => row.includes(0))) return false;

    // 檢查是否有可合併的數字
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (c < 3 && grid[r][c] === grid[r][c + 1]) return false; // 水平可合併
            if (r < 3 && grid[r][c] === grid[r + 1][c]) return false; // 垂直可合併
        }
    }
    return true;
};

/**
 * 執行一次移動操作 (向左)
 * @param {object[]} currentTiles - 原始方塊列表
 * @param {number} currentScore - 當前分數
 * @param {number} awardTile - 當前獎勵方塊值
 * @param {number} canUndoTimes - 當前可撤銷次數
 * @returns {{newTiles: object[], awardTile: number, canUndoTimes: number, newScore: number, moved: boolean, won: boolean}} - 新的狀態
 */
export const executeMove = (currentTiles, currentScore, awardTile, canUndoTimes) => {
    let newScore = currentScore;
    let moved = false;
    let won = false;

    // 複製方塊列表並清除狀態標記
    let workingTiles = currentTiles.map(tile => ({
        ...tile,
        isNew: false,
        merged: false,
        mergedFrom: undefined
    }));

    // 使用一個 4x4 網格來暫時追蹤每個位置上的方塊 ID，方便處理移動
    const tileMap = Array(4).fill(null).map(() => Array(4).fill(null));
    workingTiles.forEach(tile => {
        // 只有存在且未被標記為移除的方塊才會進入 map
        if (tile.value > 0) {
            tileMap[tile.row][tile.col] = tile;
        }
    });


    // 處理每一行（向左移動的核心邏輯）
    for (let r = 0; r < 4; r++) {
        // 1. 提取出非零方塊，並記錄它們的舊位置
        let rowTiles = tileMap[r].filter(tile => tile !== null);

        // 2. 合併
        for (let i = 0; i < rowTiles.length - 1; i++) {
            if (rowTiles[i].value === rowTiles[i + 1].value && !rowTiles[i].merged && !rowTiles[i + 1].merged) {
                // 合併後的方塊使用第一個方塊的 ID (保持 ID 穩定性)
                rowTiles[i].value *= 2;
                if (rowTiles[i].value === awardTile) {
                    canUndoTimes += 1;
                    awardTile *= 2;
                }
                newScore += rowTiles[i].value;
                rowTiles[i].merged = true; // 標記為合併後的結果
                rowTiles[i].mergedFrom = [rowTiles[i + 1].id]; // 追蹤被合併的方塊 ID

                // 將被合併的方塊值設為 0，並標記其 ID，稍後從列表中移除
                rowTiles[i + 1].value = 0;
                rowTiles[i + 1].merged = true; // 也標記為已處理 (被移除)

                if (rowTiles[i].value === 2048) {
                    won = true;
                }
            }
        }

        // 3. 重新建立新的一行 (移除被合併的方塊，並將方塊向前推)
        let finalRowTiles = rowTiles.filter(tile => tile.value > 0);

        // 4. 檢查是否有移動發生，並更新方塊位置
        for (let i = 0; i < 4; i++) {
            const tile = finalRowTiles[i];

            // 檢查原先該位置是否有方塊
            const originalTile = tileMap[r][i];

            if (tile) {
                // 如果位置改變了，則標記為移動
                if (tile.col !== i) {
                    moved = true;
                }
                // 更新方塊的列位置
                tile.col = i;
            } else if (originalTile) {
                // 如果該位置原本有方塊但現在沒有了 (被合併或移除)，則也算移動
                moved = true;
            }
        }
    }

    // 過濾掉值為 0 的方塊（它們是被合併或不存在的）
    const finalTiles = workingTiles.filter(tile => tile.value > 0);

    return {
        newTiles: finalTiles,
        awardTile,
        canUndoTimes,
        newScore,
        moved,
        won
    };
};