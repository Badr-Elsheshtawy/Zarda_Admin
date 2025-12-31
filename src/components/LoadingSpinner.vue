<template>
  <div class="flex items-center justify-center py-20">
    <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto"></div>
      <p class="text-white text-center mt-4 text-lg">
        <slot>جاري التحميل...</slot>
      </p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
</style>