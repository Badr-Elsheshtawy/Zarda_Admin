<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div class="p-[1px] rounded-3xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 max-h-[90vh] overflow-y-auto">
        <div class="bg-white/10 backdrop-blur-lg w-full max-w-4xl p-8 rounded-3xl border border-white/20 shadow-2xl">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-white flex items-center gap-3">
              <slot name="icon">
                <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </slot>
              <slot name="title">عنوان النافذة</slot>
            </h3>
            <button @click="$emit('close')" class="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <slot></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>