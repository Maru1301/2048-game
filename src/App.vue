<template>
    <v-app :style="{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        // *** 關鍵：直接在根元素設定寬度，並確保內容不會超過 ***
        width: '450px',
        minWidth: '450px',
        overflow: 'hidden' // 防止寬度計算錯誤導致滾動條
    }">
        <v-main>

            <v-container class="pa-5 elevation-12 rounded-lg" style="background-color: #faf8ef; width: 100%;">
                <div class="d-flex justify-space-between align-center mb-5">
                    <h1 class="text-h2 font-weight-bold" style="color: #776e65;">2048</h1>
                    <ScoreBoard />
                </div>

                <v-row dense class="mb-4">
                    <v-col cols="6">
                        <v-btn @click="newGame" color="primary" class="font-weight-bold" block>New Game</v-btn>
                    </v-col>
                    <v-col cols="6">
                        <v-btn @click="undo" :disabled="!canUndo" color="primary" class="font-weight-bold"
                            block>Undo</v-btn>
                    </v-col>
                </v-row>

                <GameBoard />

                <v-alert density="compact" type="info" variant="text" class="mt-4 text-center">
                    Use arrow keys to play
                </v-alert>

            </v-container>
        </v-main>
    </v-app>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from './store/gameStore';
import GameBoard from './components/GameBoard.vue';
import ScoreBoard from './components/ScoreBoard.vue';

const gameStore = useGameStore(); // 獲取 Store 實例

// 使用 storeToRefs 來解構 state 和 getters，保持響應性
const { canUndo, isGameOver } = storeToRefs(gameStore);

// 直接使用 Store 上的 Action
const newGame = () => gameStore.newGame();
const undo = () => gameStore.undo();


// 鍵盤控制
const handleKeydown = (e) => {
    // 直接訪問 Store 狀態
    if (gameStore.isGameOver) return;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const direction = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
        }[e.key];
        gameStore.move(direction); // 呼叫 Pinia Action
    }
};

onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
});
</script>