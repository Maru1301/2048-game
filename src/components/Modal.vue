<template>
    <transition name="fade">
        <div v-if="modelValue" class="modal-overlay" @click="close">
            <transition name="pop">
                <div class="modal-content" style="background-color: rgb(var(--v-theme-background));" @click.stop>
                    <slot />
                    <v-btn class="close-btn" color="primary" @click="close">Close</v-btn>
                </div>
            </transition>
        </div>
    </transition>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    modelValue: Boolean
})

const emit = defineEmits(["update:modelValue"])

function close() {
    emit("update:modelValue", false)
}

// --- ESC key support ---
function handleKey(e) {
    if (e.key === "Escape") close()
}

onMounted(() => {
    document.addEventListener("keydown", handleKey)
})

onBeforeUnmount(() => {
    document.removeEventListener("keydown", handleKey)
})
</script>

<style scoped>
/* === Background fade === */
.fade-enter-active,
.fade-leave-active {
    transition: opacity .25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* === Modal pop animation === */
.pop-enter-active,
.pop-leave-active {
    transition: all .22s ease;
}

.pop-enter-from,
.pop-leave-to {
    transform: scale(0.85);
    opacity: 0;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-content {
    padding: 20px;
    border-radius: 12px;
    min-width: 260px;
    max-width: 90%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
    position: relative;
}

.close-btn {
    margin-top: 16px;
}
</style>
