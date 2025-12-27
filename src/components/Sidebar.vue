<script setup>
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

const router = useRouter()

const logout = async () => {
  await signOut(auth)
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen bg-gray-900 text-white font-sans" dir="rtl">
    <aside class="w-64 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div class="p-6 border-b border-gray-700">
        <div class="flex items-center gap-3">
          <img
            src="/zarda_logo.png"
            alt="Zarda"
            class="h-9 w-9"
            @error="(e) => (e.target.src = '/zarda_logo.png')"
          />
          <h1 class="text-xl font-bold text-blue-500">Zarda Admin</h1>
        </div>
      </div>

      <nav class="flex-1 p-4 space-y-4">
        <div>
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
            العروض
          </h3>
          <div class="space-y-1">
            <RouterLink
              to="/stats"
              active-class="bg-blue-600 text-white"
              class="block p-3 rounded-lg text-gray-300 hover:bg-gray-700 transition flex items-center gap-3"
            >
              📊 إحصائيات العروض
            </RouterLink>
            <RouterLink
              to="/packages"
              active-class="bg-blue-600 text-white"
              class="block p-3 rounded-lg text-gray-300 hover:bg-gray-700 transition flex items-center gap-3"
            >
              ✈️ إدارة العروض
            </RouterLink>
          </div>
        </div>

        <div>
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
            الاستبيانات
          </h3>
          <div class="space-y-1">
            <RouterLink
              to="/survey-stats"
              active-class="bg-blue-600 text-white"
              class="block p-3 rounded-lg text-gray-300 hover:bg-gray-700 transition flex items-center gap-3"
            >
              📈 إحصائيات الاستبيانات
            </RouterLink>
            <RouterLink
              to="/agencies"
              active-class="bg-blue-600 text-white"
              class="block p-3 rounded-lg text-gray-300 hover:bg-gray-700 transition flex items-center gap-3"
            >
              🏢 إدارة الوكالات
            </RouterLink>
            <RouterLink
              to="/questions"
              active-class="bg-blue-600 text-white"
              class="block p-3 rounded-lg text-gray-300 hover:bg-gray-700 transition flex items-center gap-3"
            >
              ❓ إدارة الأسئلة
            </RouterLink>
          </div>
        </div>
      </nav>

      <div class="p-4 border-t border-gray-700">
        <button
          @click="logout"
          class="w-full bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white p-3 rounded-lg transition font-bold"
        >
          تسجيل الخروج
        </button>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto bg-gray-900 p-8">
      <RouterView />
    </main>
  </div>
</template>
