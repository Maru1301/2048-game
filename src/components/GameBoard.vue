<template>
    <div class="game-board" ref="boardRef">
        <div v-for="i in 16" :key="i" class="cell"></div>

        <transition-group name="tile">
            <GameTile v-for="tile in tiles" :key="tile.id" :tile="tile" :board-size="boardSize" />
        </transition-group>

    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia'; // 引入 Pinia 輔助函式
import { useGameStore } from '../store/gameStore'; // 引入 Pinia Store
import GameTile from './GameTile.vue';

const gameStore = useGameStore();

// 使用 storeToRefs 獲取 state 屬性，保持響應性
const { isGameOver, won } = storeToRefs(gameStore);
// 直接使用 getter
const tiles = computed(() => gameStore.tiles);

const gameOverMessage = computed(() => won.value ? 'You Win!' : 'Game Over!');

const newGame = () => gameStore.newGame(); // 直接呼叫 Pinia Action

// 獲取盤面寬度，以便計算方塊位置和大小
const boardRef = ref(null);
const boardSize = ref(430);

onMounted(() => {
    // 確保在組件掛載後獲取實際的盤面寬度 (用於響應式計算方塊大小)
    if (boardRef.value) {
        boardSize.value = boardRef.value.offsetWidth;
    }
});

</script>

<style scoped>
.game-board {
    background-color: rgb(var(--v-theme-surface));
    border-radius: 10px;
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    position: relative;
    /* 確保寬高一致，形成正方形 */
    width: 100%;
    aspect-ratio: 1;
}

.cell {
    background-color: rgba(var(--v-theme-on-surface), 0.1);
    border-radius: 5px;
    aspect-ratio: 1;
}

/* 遊戲結束覆蓋層 */
.game-over-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(238, 228, 218, 0.95);
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    z-index: 100;
}

.game-over-text {
    font-size: 48px;
    color: #776e65;
    font-weight: bold;
    margin-bottom: 20px;
}

.game-over-message {
    font-size: 16px;
    color: #776e65;
    margin-bottom: 20px;
}

/* --- 動畫樣式 (與原始 HTML 保持一致) --- */
.tile-enter-active {
    animation: appear 0.2s ease-out;
}

.tile-leave-active {
    transition: opacity 0.15s;
}

.tile-leave-to {
    opacity: 0;
}

@keyframes appear {
    from {
        transform: scale(0);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.tile-move {
    transition: transform 0.15s ease-in-out;
    /* Vue transition-group 專門用於元素移動 */
}
</style>