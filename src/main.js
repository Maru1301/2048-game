import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia'; // 引入 Pinia
import { useGameStore } from './store/gameStore';

// --- Vuetify 設定 (與之前保持一致) ---
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'customTheme',
        themes: {
            customTheme: {
                dark: false,
                colors: {
                    background: '#faf8ef',
                    surface: '#bbada0',
                    primary: '#8f7a66',
                    secondary: '#776e65',
                }
            }
        }
    }
});
// --------------------

const pinia = createPinia(); // 建立 Pinia 實例

const app = createApp(App);
app.use(pinia); // 使用 Pinia
app.use(vuetify);
app.mount('#app');

// Pinia 載入後，手動觸發載入上次的遊戲狀態
// Store 已經透過 app.use(pinia) 註冊，我們直接呼叫 useGameStore 即可
const gameStore = useGameStore(); // 獲取 Store 實例
await gameStore.loadGame();