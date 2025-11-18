import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia'; // 引入 Pinia
import { useGameStore } from './store/gameStore';

import vuetify from './plugins/vuetify';

const pinia = createPinia(); // 建立 Pinia 實例

const app = createApp(App);
app.use(pinia); // 使用 Pinia
app.use(vuetify);
app.mount('#app');

// Pinia 載入後，手動觸發載入上次的遊戲狀態
// Store 已經透過 app.use(pinia) 註冊，我們直接呼叫 useGameStore 即可
const gameStore = useGameStore(); // 獲取 Store 實例
await gameStore.loadGame();