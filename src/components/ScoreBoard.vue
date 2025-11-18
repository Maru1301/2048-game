<template>
    <div class="d-flex gap-2">
        <div class="score-container">
            <div class="score-label">SCORE</div>
            <div class="score">{{ score }}</div>
        </div>
        <div class="score-container">
            <div class="score-label">BEST</div>
            <div class="score">{{ bestScore }}</div>
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'; // 引入 Pinia 輔助函式
import { useGameStore } from '../store/gameStore'; // 引入 Pinia Store

const gameStore = useGameStore();
// 使用 storeToRefs 來獲取 state 的響應式引用
const { score, bestScore } = storeToRefs(gameStore); 
</script>

<style scoped>
.score-container {
    background-color: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    padding: 8px 12px;
    border-radius: 5px;
    text-align: center;
    min-width: 70px;
    line-height: 1;
}

.score-label {
    font-size: 10px;
    text-transform: uppercase;
    font-weight: bold;
    opacity: 0.8;
}

.score {
    font-size: 20px;
    font-weight: bold;
    margin-top: 3px;
}

.gap-2 {
    gap: 8px;
    /* 模擬原始 CSS 的 gap: 10px */
}
</style>