<template>
    <div :class="['tile', `tile-${tile.value}`]" :style="tileStyle">
        {{ tile.value }}
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTheme } from 'vuetify';

const props = defineProps({
    tile: {
        type: Object,
        required: true,
    },
    boardSize: {
        type: Number,
        default: 430, // 假設棋盤的基礎尺寸
    }
});

const theme = useTheme();

const lightTileColors = {
    2: { bg: '#eee4da', color: '#776e65', fontSize: '32px' },
    4: { bg: '#ede0c8', color: '#776e65', fontSize: '32px' },
    8: { bg: '#f2b179', color: '#f9f6f2', fontSize: '32px' },
    16: { bg: '#f59563', color: '#f9f6f2', fontSize: '32px' },
    32: { bg: '#f67c5f', color: '#f9f6f2', fontSize: '32px' },
    64: { bg: '#f65e3b', color: '#f9f6f2', fontSize: '32px' },
    128: { bg: '#edcf72', color: '#f9f6f2', fontSize: '28px' },
    256: { bg: '#edcc61', color: '#f9f6f2', fontSize: '28px' },
    512: { bg: '#edc850', color: '#f9f6f2', fontSize: '28px' },
    1024: { bg: '#edc53f', color: '#f9f6f2', fontSize: '24px' },
    2048: { bg: '#edc22e', color: '#f9f6f2', fontSize: '24px' },
    4096: { bg: '#3c3a32', color: '#f9f6f2', fontSize: '20px' },
};

const darkTileColors = {
    2: { bg: '#003cadff', color: '#E0E0E0', fontSize: '32px' },
    4: { bg: '#1e69d9', color: '#E0E0E0', fontSize: '32px' },
    8: { bg: '#BB86FC', color: '#121212', fontSize: '32px' },
    16: { bg: '#90CAF9', color: '#121212', fontSize: '32px' },
    32: { bg: '#81C784', color: '#121212', fontSize: '32px' },
    64: { bg: '#FFD54F', color: '#121212', fontSize: '32px' },
    128: { bg: '#FF8A65', color: '#121212', fontSize: '28px' },
    256: { bg: '#F06292', color: '#121212', fontSize: '28px' },
    512: { bg: '#7986CB', color: '#FFFFFF', fontSize: '28px' },
    1024: { bg: '#4DB6AC', color: '#FFFFFF', fontSize: '24px' },
    2048: { bg: '#AED581', color: '#121212', fontSize: '24px' },
    4096: { bg: '#9575CD', color: '#FFFFFF', fontSize: '20px' },
};


const tileStyle = computed(() => {
    const margin = 10; // 邊距
    const gap = 10;    // 間隔
    // 總寬度 - 2*邊距 / 4 (格子數)
    const cellSize = (props.boardSize - 2 * margin - 3 * gap) / 4;
    const tileColors = theme.global.current.value.dark ? darkTileColors : lightTileColors;
    const colors = tileColors[props.tile.value] || tileColors[4096];

    return {
        left: `${margin + props.tile.col * (cellSize + gap)}px`,
        top: `${margin + props.tile.row * (cellSize + gap)}px`,
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        backgroundColor: colors.bg,
        color: colors.color,
        fontSize: colors.fontSize,
    };
});
</script>

<style scoped>
/* 核心的 Tile 樣式 */
.tile {
    position: absolute;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    transition: all 0.15s ease-in-out;
    /* 動畫 */
    z-index: 50;
}
</style>