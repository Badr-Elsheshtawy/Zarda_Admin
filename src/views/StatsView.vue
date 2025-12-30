<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js'
import PageHeader from '@/components/PageHeader.vue'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const packages = ref([])
const loading = ref(true)
const siteVisitors = ref(0)

const fetchStats = async () => {
  try {
    // جلب العروض من supabase
    const { data: pkgs, error: pkgErr } = await supabase
      .from('packages')
      .select('*')
    if (pkgErr) throw pkgErr
    packages.value = pkgs.map(p => ({
      ...p,
      views: p.views || 0,
      active: typeof p.active === 'boolean' ? p.active : true
    }))

    // جلب إحصائيات الزوار من supabase
    const { data: stats, error: statsErr } = await supabase
      .from('stats')
      .select('visitors')
      .eq('id', 1)
      .single()
    if (!statsErr && stats) siteVisitors.value = stats.visitors || 0
  } finally {
    loading.value = false
  }
}

const totalPackages = computed(() => packages.value.length)
const totalActive = computed(() => packages.value.filter(p => p.active).length)
const totalViews = computed(() => packages.value.reduce((acc, curr) => acc + curr.views, 0))
const avgViews = computed(() => totalPackages.value ? Math.round(totalViews.value / totalPackages.value) : 0)

const topPackagesChartData = computed(() => {
  const sorted = [...packages.value].sort((a, b) => b.views - a.views).slice(0, 5)
  
  return {
    labels: sorted.map(p => p.title.length > 20 ? p.title.substring(0, 20) + '...' : p.title),
    datasets: [{
      label: 'عدد المشاهدات',
      backgroundColor: '#3b82f6',
      hoverBackgroundColor: '#2563eb',
      data: sorted.map(p => p.views),
      borderRadius: 8,
      barThickness: 40
    }]
  }
})

const categoryChartData = computed(() => {
  const counts = {}
  packages.value.forEach(p => {
    const cat = p.category || 'غير محدد'
    counts[cat] = (counts[cat] || 0) + 1
  })

  return {
    labels: Object.keys(counts),
    datasets: [{
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      data: Object.values(counts),
      borderWidth: 0
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#e5e7eb', font: { family: 'Cairo' } } },
    tooltip: { titleFont: { family: 'Cairo' }, bodyFont: { family: 'Cairo' } }
  },
  scales: {
    y: { 
      ticks: { color: '#9ca3af' }, 
      grid: { color: '#374151' },
      beginAtZero: true
    },
    x: { 
      ticks: { color: '#9ca3af', font: { family: 'Cairo' } }, 
      grid: { display: false } 
    }
  }
}

onMounted(fetchStats)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white font-sans" dir="rtl">
    <div class="container mx-auto px-6 py-8">
      <PageHeader>
        <template #icon>
          <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </template>
        <template #title>لوحة الإحصائيات</template>
        <template #subtitle>تحليل شامل لأداء العروض والموقع</template>
        <template #actions>
          <button @click="fetchStats" class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all duration-300 flex items-center gap-3 font-semibold transform hover:scale-105">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            تحديث البيانات
          </button>
        </template>
      </PageHeader>
    
    <div v-if="loading" class="text-center py-32">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      <p class="mt-4 text-gray-400">جاري تحليل البيانات...</p>
    </div>
    
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition">
          <div class="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition"></div>
          <div class="text-gray-400 mb-1 text-sm font-bold">إجمالي العروض</div>
          <div class="text-4xl font-bold text-white mt-2">{{ totalPackages }}</div>
          <div class="mt-4 text-xs text-blue-400 font-bold">العروض النشطة: {{ totalActive }}</div>
        </div>
        
        <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group hover:border-green-500/50 transition">
          <div class="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition"></div>
          <div class="text-gray-400 mb-1 text-sm font-bold">إجمالي المشاهدات</div>
          <div class="text-4xl font-bold text-green-400 mt-2">{{ totalViews }}</div>
          <div class="mt-4 text-xs text-green-500/80 font-bold">زيارة من العملاء</div>
        </div>

        <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group hover:border-yellow-500/50 transition">
          <div class="absolute -right-6 -top-6 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition"></div>
          <div class="text-gray-400 mb-1 text-sm font-bold">متوسط التفاعل</div>
          <div class="text-4xl font-bold text-yellow-400 mt-2">{{ avgViews }}</div>
          <div class="mt-4 text-xs text-yellow-500/80 font-bold">مشاهدة لكل عرض تقريباً</div>
        </div>

        <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition">
          <div class="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition"></div>
          <div class="text-gray-400 mb-1 text-sm font-bold">زوار الموقع</div>
          <div class="text-4xl font-bold text-purple-400 mt-2">{{ siteVisitors }}</div>
          <div class="mt-4 text-xs text-purple-500/80 font-bold">زيارة فريدة لكل متصفح</div>
        </div>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col">
          <h3 class="text-xl font-bold mb-6 text-gray-200 flex items-center gap-2">
            <span>🔥</span> العروض الأكثر شعبية
          </h3>
          <div class="h-80 w-full">
            <Bar :data="topPackagesChartData" :options="chartOptions" />
          </div>
        </div>

        <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col">
          <h3 class="text-xl font-bold mb-6 text-gray-200 flex items-center gap-2">
            <span>📋</span> تنوع العروض
          </h3>
          <div class="h-80 w-full flex justify-center items-center">
            <Doughnut :data="categoryChartData" :options="{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { 
                legend: { position: 'bottom', labels: { color: '#fff', font: { family: 'Cairo' } } } 
              }
            }" />
          </div>
        </div>

      </div>
    </div>
  </div>
</div>
</template>
  

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>