<script setup>
import { ref, onMounted, computed } from 'vue'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const packages = ref([])
const loading = ref(true)
const siteVisitors = ref(0)

const fetchStats = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'packages'))
    packages.value = querySnapshot.docs.map(d => ({
      ...d.data(),
      views: d.data().views || 0,
      active: typeof d.data().active === 'boolean' ? d.data().active : true
    }))
    
    const siteDoc = await getDoc(doc(db, 'stats', 'site'))
    siteVisitors.value = siteDoc.exists() ? (siteDoc.data().visitors || 0) : 0
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
  <div class="space-y-8 animate-fade-in">
    <div class="flex justify-between items-center">
      <h2 class="text-3xl font-bold text-blue-500">لوحة الإحصائيات 📊</h2>
      <button @click="fetchStats" class="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded text-gray-300 transition">🔄 تحديث البيانات</button>
    </div>
    
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