import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia'; // 引入 Pinia
import { useGameStore } from './store/gameStore';

import { createDynamicVuetify } from './plugins/vuetify';

// 1. 輔助函式：非同步獲取主題名稱
function getInitialTheme() {
    return new Promise(resolve => {
        // 檢查是否在擴充功能環境中
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(['theme'], (result) => {
                // 如果找到 'theme'，則使用它；否則預設為 'light'
                resolve(result.theme || 'light');
            });
        } else {
            // 非擴充功能環境，預設為 'light'
            resolve('light');
        }
    });
}

// 2. 使用 IIFE (立即執行函式表達式) 執行非同步啟動
(async () => {

    // A. ⚠️ 等待主題配置載入完成 ⚠️
    const initialThemeName = await getInitialTheme();

    // B. 動態創建 Vuetify 實例，使用載入的主題名稱
    const vuetify = createDynamicVuetify(initialThemeName);

    const pinia = createPinia(); // 建立 Pinia 實例

    const app = createApp(App);
    app.use(pinia); // 使用 Pinia
    app.use(vuetify);
    app.mount('#app');

    // Pinia 載入後，手動觸發載入上次的遊戲狀態
    // Store 已經透過 app.use(pinia) 註冊，我們直接呼叫 useGameStore 即可
    const gameStore = useGameStore(); // 獲取 Store 實例
    await gameStore.loadGame();
})();