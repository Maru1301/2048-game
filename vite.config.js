import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    build: {
        // 輸出到 'dist' 資料夾
        outDir: 'dist',
        // 禁用 CSS 代碼分割（讓它更容易載入）
        cssCodeSplit: false,
        rollupOptions: {
            input: 'index.html', // 確保將 index.html 作為入口
        },
    },
    // 設置 Vuetify 相關配置，例如 CSS 處理
    css: {
        preprocessorOptions: {
            scss: {
                // Vuetify 樣式導入
                additionalData: `@import 'vuetify/styles/settings';`
            },
        },
    },
})