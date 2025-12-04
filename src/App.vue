<template>
    <v-app :style="{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        // *** 關鍵：直接在根元素設定寬度，並確保內容不會超過 ***
        width: '450px',
        minWidth: '450px',
        overflow: 'hidden' // 防止寬度計算錯誤導致滾動條
    }">
        <v-main>

            <v-container class="pa-5 elevation-12 rounded-lg"
                style="background-color: rgb(var(--v-theme-background)); width: 100%;">
                <div class="d-flex justify-space-between align-center mb-5">
                    <h1 class="text-h2 font-weight-bold" style="color: #776e65;">2048</h1>
                    <div class="d-flex">
                        <v-switch v-model="isDarkTheme" :label="isDarkTheme ? 'Dark' : 'Light'"
                            icon="mdi-theme-light-dark" density="compact" class="mr-4 mt-0"
                            color="secondary"></v-switch>
                        <ScoreBoard />
                    </div>
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

                <v-dialog v-model="showGameOverDialog" persistent max-width="320">
                    <v-card>
                        <v-card-title class="text-h6">Game Over!</v-card-title>
                        <v-card-actions>
                            <v-spacer />
                            <v-btn color="primary" @click="newGame">New Game</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-alert density="compact" type="info" variant="text" class="mt-4 text-center">
                    Use arrow keys to play
                </v-alert>

            </v-container>
        </v-main>
    </v-app>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useTheme } from 'vuetify'
import { storeToRefs } from 'pinia';
import { useGameStore } from './store/gameStore';
import GameBoard from './components/GameBoard.vue';
import ScoreBoard from './components/ScoreBoard.vue';

const theme = useTheme()

// 1. 定義主題狀態
// 初始值從 Vuetify 當前使用的全域主題名稱獲取 (該名稱已由 main.js 正確設置)
const isDarkTheme = ref(theme.global.name.value === 'dark');

// 2. 監聽 isDarkTheme 變化，執行切換並儲存狀態
watch(isDarkTheme, (isDark) => {
    // A. 切換 Vuetify 主題
    const newThemeName = isDark ? 'dark' : 'light';
    theme.global.name.value = newThemeName;

    // B. 儲存主題到 Chrome Storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ theme: newThemeName });
    }
}, { immediate: true }); // { immediate: true } 確保組件初始化時，狀態被同步到 Vuetify

const gameStore = useGameStore(); // 獲取 Store 實例

// 使用 storeToRefs 來解構 state 和 getters，保持響應性
const { canUndo, isGameOver } = storeToRefs(gameStore);

// 本地控制對話框的顯示狀態
const showGameOverDialog = ref(false);

// 監聽 Store 的 isGameOver，當遊戲結束時開啟對話框
watch(isGameOver, (val) => {
    if (val) showGameOverDialog.value = true;
});

// 直接使用 Store 上的 Action
const newGame = () => {
    showGameOverDialog.value = false;
    gameStore.newGame();
};
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