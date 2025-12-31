<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl mb-8">
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
      <div class="flex-1">
        <h1 class="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div class="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl border border-white/10">
            <slot name="icon">
              <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </slot>
          </div>
          <slot name="title">عنوان الصفحة</slot>
        </h1>
        <p class="text-slate-300 text-lg">
          <slot name="subtitle">وصف الصفحة</slot>
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
</style>