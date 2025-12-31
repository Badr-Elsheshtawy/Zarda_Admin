<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white font-sans" dir="rtl">
    <div class="container mx-auto px-6 py-8">
      <PageHeader>
        <template #icon>
          <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
          </svg>
        </template>
        <template #title>لوحة التحكم الرئيسية</template>
        <template #subtitle>نظرة عامة على أداء النظام والعروض</template>
        <template #actions>
          <button
            @click="refreshData"
            class="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-3 font-semibold transform hover:scale-105"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            تحديث البيانات
          </button>
        </template>
      </PageHeader>

      <div v-if="loading" class="flex justify-center items-center py-20">
        <LoadingSpinner>جاري تحميل البيانات...</LoadingSpinner>
      </div>

      <div class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </template>
            <template #label>إجمالي العروض</template>
            <template #value>{{ stats.totalPackages }}</template>
            <template #subtitle>عروض نشطة: {{ stats.activePackages }}</template>
          </StatCard>

          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </template>
            <template #label>إجمالي المشاهدات</template>
            <template #value>{{ stats.totalViews }}</template>
            <template #subtitle>متوسط: {{ stats.avgViews }} لكل عرض</template>
          </StatCard>

          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path>
              </svg>
            </template>
            <template #label>العروض المميزة</template>
            <template #value>{{ stats.featuredPackages }}</template>
            <template #subtitle>{{ Math.round((stats.featuredPackages / stats.totalPackages) * 100) || 0 }}% من الإجمالي</template>
          </StatCard>

          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
              </svg>
            </template>
            <template #label>زوار الموقع</template>
            <template #value>{{ stats.siteVisitors }}</template>
            <template #subtitle>زيارات فريدة</template>
          </StatCard>
        </div>

        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-white flex items-center gap-3">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              العروض المضافة مؤخراً
            </h3>
            <router-link
              to="/packages"
              class="text-blue-400 hover:text-blue-300 transition-colors text-sm font-semibold"
            >
              عرض الكل →
            </router-link>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="pkg in recentPackages"
              :key="pkg.id"
              class="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200 group"
            >
              <div class="flex items-start gap-4">
                <img
                  :src="pkg.imageUrl || '/zarda_logo.png'"
                  @error="$event.target.src = '/zarda_logo.png'"
                  class="w-16 h-16 rounded-lg object-cover border border-white/20"
                />
                <div class="flex-1">
                  <h4 class="font-semibold text-white text-sm mb-1 line-clamp-2">{{ pkg.title }}</h4>
                  <p class="text-slate-400 text-xs mb-2">{{ pkg.destination }}</p>
                  <div class="flex items-center justify-between">
                    <span class="text-green-400 font-bold text-sm">{{ pkg.price }} {{ pkg.currency || 'د.ل' }}</span>
                    <span class="text-slate-500 text-xs">{{ pkg.views || 0 }} مشاهدة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              توزيع الفئات
            </h3>
            <div class="space-y-4">
              <div v-for="[category, count] in Object.entries(stats.categoryStats)" :key="category" class="flex items-center justify-between">
                <span class="text-slate-300">{{ category || 'غير محدد' }}</span>
                <div class="flex items-center gap-3">
                  <div class="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                      :style="{ width: `${stats.totalPackages ? (count / stats.totalPackages) * 100 : 0}%` }"
                    ></div>
                  </div>
                  <span class="text-white font-semibold w-8 text-left">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              الأداء اليومي
            </h3>
            <div class="text-center py-8">
              <div class="text-4xl font-bold text-green-400 mb-2">{{ stats.todayViews || 0 }}</div>
              <p class="text-slate-400">مشاهدات اليوم</p>
              <div class="mt-4 text-sm text-slate-500">
                مقارنة بالأمس: <span class="text-green-400">+{{ stats.viewsGrowth || 0 }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

import { useAdminPackagesStore } from '@/stores/packages'
import { useStatsStore } from '@/stores/stats'
import { useResponsesStore } from '@/stores/responses'

const packagesStore = useAdminPackagesStore()
const statsStore = useStatsStore()
const responsesStore = useResponsesStore()

const loading = ref(true)

const packages = computed(() => packagesStore.all)
const siteVisitors = computed(() => statsStore.visitors)

const stats = computed(() => {
  const totalPackages = packages.value.length
  const activePackages = packages.value.filter(p => p.active !== false).length
  const featuredPackages = packages.value.filter(p => p.isFeatured).length
  const totalViews = packages.value.reduce((acc, curr) => acc + (curr.views || 0), 0)
  const avgViews = totalPackages ? Math.round(totalViews / totalPackages) : 0

  const categoryStats = {}
  packages.value.forEach(p => {
    const cat = p.category || 'غير محدد'
    categoryStats[cat] = (categoryStats[cat] || 0) + 1
  })

  return {
    totalPackages,
    activePackages,
    featuredPackages,
    totalViews,
    avgViews,
    siteVisitors: siteVisitors.value,
    categoryStats,
    todayViews: 0, 
    viewsGrowth: 0 
  }
})

const recentPackages = computed(() => {
  return [...packages.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6)
})

const fetchData = async () => {
  try {
    loading.value = true
    await Promise.all([
      packagesStore.fetchAll({ force: true }),
      statsStore.fetchAll({ force: true }),
      responsesStore.fetchAll({ force: true })
    ])
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>