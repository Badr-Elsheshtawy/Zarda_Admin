
<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const isMobile = ref(false)
const drawerOpen = ref(false)

const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Error logging out:', error.message)
  router.push('/login')
}

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  drawerOpen.value = !isMobile.value
})

watch(isMobile, (val) => {
  drawerOpen.value = !val
})
</script>

<template>
  <div class="flex h-screen bg-gray-900 text-white font-sans" dir="rtl">
    <!-- زر القائمة للجوال -->
    <button
      v-if="isMobile && !drawerOpen"
      @click="drawerOpen = true"
      class="fixed top-4 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg md:hidden"
      aria-label="فتح القائمة"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- طبقة خلفية عند فتح القائمة في الجوال -->
    <div
      v-if="isMobile && drawerOpen"
      class="fixed inset-0 bg-black/60 z-30 md:hidden"
      @click="drawerOpen = false"
    ></div>

    <!-- القائمة الجانبية -->
    <aside
      :class="[
        'bg-gray-800 border-l border-gray-700 flex flex-col shadow-2xl z-40 fixed md:static transition-all duration-300',
        isMobile
          ? [drawerOpen ? 'right-0' : '-right-72', 'top-0 h-full w-64 md:w-64']
          : ['w-64 h-full']
      ]"
      style="max-width: 100vw;"
    >
      <div class="p-6 border-b border-gray-700 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/zarda_logo.png" alt="Zarda" class="h-9 w-9 object-contain" @error="(e) => e.target.src = '/zarda_logo.png'">
          <h1 class="text-xl font-bold text-blue-500">Zarda Admin</h1>
        </div>
        <!-- زر إغلاق للجوال -->
        <button v-if="isMobile" @click="drawerOpen = false" class="md:hidden text-gray-400 hover:text-white p-2 rounded-full focus:outline-none">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
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

    <!-- المحتوى الرئيسي -->
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
@media (max-width: 767px) {
  aside {
    box-shadow: 0 0 40px 0 #0008;
    transition: right 0.3s cubic-bezier(.4,0,.2,1);
  }
}
</style>