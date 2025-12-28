<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105">
    <div class="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all duration-500"></div>
    <div class="relative z-10">
      <div class="text-slate-300 mb-1 text-sm font-bold flex items-center gap-2">
        <slot name="icon">
          <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
        </slot>
        <slot name="label">الإحصائية</slot>
      </div>
      <div class="text-4xl font-bold text-white mt-2">
        <slot name="value">0</slot>
      </div>
      <div class="mt-4 text-xs text-blue-400/80 font-bold">
        <slot name="subtitle">وصف إضافي</slot>
      </div>
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<script setup>
// No script needed for this component
</script>

<style scoped>
/* Additional styles if needed */
</style>