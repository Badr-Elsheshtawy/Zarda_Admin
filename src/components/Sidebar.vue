<script setup>
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()

const logout = async () => {
  const { error } = await supabase.auth.signOut()
  
  if (error) console.error('Error logging out:', error.message)
  
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen bg-gray-900 text-white font-sans" dir="rtl">
    
    <aside class="w-64 bg-gray-800 border-l border-gray-700 flex flex-col shadow-2xl z-20">
      <div class="p-6 border-b border-gray-700">
        <div class="flex items-center gap-3">
          <img src="/zarda_logo.png" alt="Zarda" class="h-9 w-9 object-contain" @error="(e) => e.target.src = '/zarda_logo.png'">
          <h1 class="text-xl font-bold text-blue-500">Zarda Admin</h1>
        </div>
      </div>
      
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <RouterLink to="/dashboard" active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="block p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all flex items-center gap-3">
          🏠 لوحة التحكم
        </RouterLink>
        <RouterLink to="/stats" active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="block p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all flex items-center gap-3">
          📊 الإحصائيات
        </RouterLink>
        <RouterLink to="/packages" active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="block p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all flex items-center gap-3">
          ✈️ إدارة العروض
        </RouterLink>
        <RouterLink to="/agencies" active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="block p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all flex items-center gap-3">
          🏢 إدارة الوكالات
        </RouterLink>
        <RouterLink to="/questions" active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="block p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all flex items-center gap-3">
          ❓ إدارة الأسئلة
        </RouterLink>
        <RouterLink to="/survey-stats" active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="block p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all flex items-center gap-3">
          📈 نتائج الاستبيانات
        </RouterLink>
      </nav>

      <div class="p-4 border-t border-gray-700">
        <button @click="logout" class="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white p-3 rounded-lg transition-all duration-200 font-bold border border-red-500/20 hover:border-red-600">
          <span>🚪</span>
          تسجيل الخروج
        </button>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto bg-gray-900 p-8 relative">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>