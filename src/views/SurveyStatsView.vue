<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white font-sans" dir="rtl">
    <div class="container mx-auto px-6 py-8">
      <PageHeader>
        <template #icon>
          <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </template>
        <template #title>إحصائيات الاستبيانات</template>
        <template #subtitle>تحليل شامل لأداء الاستبيانات والردود</template>
        <template #actions>
          <button
            @click="refreshData"
            class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all duration-300 flex items-center gap-3 font-semibold transform hover:scale-105"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            تحديث البيانات
          </button>
        </template>
      </PageHeader>

      <div v-if="loading" class="flex justify-center items-center py-20">
        <LoadingSpinner>جاري تحليل البيانات...</LoadingSpinner>
      </div>

      <div v-else class="space-y-8">
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </template>
            <template #label>إجمالي الردود</template>
            <template #value>{{ stats.totalResponses }}</template>
            <template #subtitle>ردود مكتملة</template>
          </StatCard>
          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </template>
            <template #label>متوسط الرضا</template>
            <template #value>{{ stats.averageSatisfaction.toFixed(1) }}/5</template>
            <template #subtitle>درجة الرضا العامة</template>
          </StatCard>
          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </template>
            <template #label>معدل الإنجاز</template>
            <template #value>{{ stats.completionRate > 0 ? stats.completionRate + '%' : 'لا يوجد بيانات' }}</template>
            <template #subtitle>نسبة إكمال الاستبيانات</template>
          </StatCard>
          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </template>
            <template #label>NPS (مؤشر رضا العملاء)</template>
            <template #value>{{ stats.npsScore }}</template>
            <template #subtitle>النسبة بين المروجين والمنتقدين</template>
          </StatCard>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl p-6 border border-emerald-500/20">
            <div class="flex items-center mb-4">
              <div class="p-2 bg-emerald-500/20 rounded-lg mr-3">
                <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-white">أكثر الشركات رضا</h3>
            </div>
            <div class="space-y-3">
              <div v-for="(agency, index) in stats.topAgencies" :key="agency.name" class="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-sm font-bold text-emerald-400 mr-3">
                    {{ index + 1 }}
                  </div>
                  <div>
                    <p class="text-white font-medium">{{ agency.name }}</p>
                    <p class="text-emerald-300 text-sm">نسبة الرضا: {{ (agency.average * 20).toFixed(0) }}%</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-white font-bold">{{ agency.average.toFixed(1) }}/5</p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl p-6 border border-red-500/20">
            <div class="flex items-center mb-4">
              <div class="p-2 bg-red-500/20 rounded-lg mr-3">
                <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-white">أقل الشركات رضا</h3>
            </div>
            <div class="space-y-3">
              <div v-for="(agency, index) in stats.lowestAgencies" :key="agency.name" class="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center text-sm font-bold text-red-400 mr-3">
                    {{ index + 1 }}
                  </div>
                  <div>
                    <p class="text-white font-medium">{{ agency.name }}</p>
                    <p class="text-red-300 text-sm">نسبة الرضا: {{ (agency.average * 20).toFixed(0) }}%</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-white font-bold">{{ agency.average.toFixed(1) }}/5</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              توزيع التقييمات
            </h3>
            <div class="h-64">
              <Bar :data="ratingDistributionData" :options="chartOptions" />
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              الرضا حسب القسم
            </h3>
            <div class="h-64">
              <Bar :data="categorySatisfactionData" :options="chartOptions" />
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
              </svg>
              توزيع NPS
            </h3>
            <div class="h-64">
              <Doughnut :data="npsDistributionData" :options="doughnutOptions" />
            </div>
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            إحصائيات الأسئلة التفصيلية
          </h3>
          
          <div class="flex flex-wrap gap-4 mb-6">
            <select v-model="selectedQuestionType" class="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">كل الأنواع</option>
              <option value="text">نصي</option>
              <option value="choice">اختيار من متعدد</option>
              <option value="rating">تقييم</option>
            </select>
            <select v-model="selectedAgency" class="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">كل الوكالات</option>
              <option v-for="agency in agencies" :key="agency.id" :value="agency.name">{{ agency.name }}</option>
            </select>
            <select v-model="selectedRating" class="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">كل التقييمات</option>
              <option v-for="n in 5" :key="n" :value="n">{{ n }}/5</option>
            </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <div v-for="q in filteredQuestionsStats" :key="q.id" class="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div class="font-bold text-white mb-3 border-b border-white/10 pb-2">{{ q.text }}</div>
              <table class="w-full text-sm text-white/80">
                <thead>
                  <tr class="text-right text-gray-400">
                    <th class="pb-2">الإجابة / الاختيار</th>
                    <th class="pb-2 text-left">العدد</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr v-for="opt in q.options" :key="opt.value">
                    <td class="py-2">{{ opt.value }}</td>
                    <td class="py-2 font-bold text-left" dir="ltr">{{ opt.count }}</td>
                  </tr>
                  <tr v-if="q.options.length === 0">
                    <td colspan="2" class="py-2 text-center text-gray-500">لا توجد إجابات مطابقة</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            آخر الردود
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-white">
              <thead class="border-b border-white/20">
                <tr class="text-right">
                  <th class="p-4 text-gray-300">الوكالة</th>
                  <th class="p-4 text-gray-300">الموظف</th>
                  <th class="p-4 text-gray-300">القسم</th>
                  <th class="p-4 text-gray-300">متوسط التقييم</th>
                  <th class="p-4 text-gray-300">NPS</th>
                  <th class="p-4 text-gray-300">التاريخ</th>
                  <th class="p-4 text-gray-300">تفاصيل</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10">
                <tr v-for="response in filteredRecentResponses" :key="response.id" class="hover:bg-white/5 transition">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <img :src="response.agencyLogo || '/zarda_logo.png'" @error="$event.target.src = '/zarda_logo.png'" class="w-8 h-8 rounded-lg object-cover" />
                      <span>{{ response.agencyName }}</span>
                    </div>
                  </td>
                  <td class="p-4">{{ response.employeeName || 'غير محدد' }}</td>
                  <td class="p-4">{{ response.department || '-' }}</td>
                  <td class="p-4">
                    <span class="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">{{ calculateAverageRating(response).toFixed(1) }}/5</span>
                  </td>
                  <td class="p-4">
                    <span :class="(response.finalNps || response.nps || 0) >= 9 ? 'bg-green-500/20 text-green-300' : (response.finalNps || response.nps || 0) >= 7 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'" class="px-2 py-1 rounded">
                      {{ response.finalNps || response.nps || 0 }}
                    </span>
                  </td>
                  <td class="p-4 text-gray-400">{{ formatDate(response.created_at) }}</td>
                  <td class="p-4">
                    <button @click="openResponseModal(response)" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition text-sm">عرض</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <SurveyResponseModal v-if="showResponseModal" :response="selectedResponse" @close="showResponseModal = false" />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import SurveyResponseModal from '@/components/SurveyResponseModal.vue'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, Filler } from 'chart.js'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useResponsesStore } from '@/stores/responses'
import { useQuestionsStore } from '@/stores/questions'
import { useAgenciesStore } from '@/stores/agencies'
import { useStatsStore } from '@/stores/stats'

// تسجيل مكونات الرسم البياني (تمت إزالة LineElement و PointElement لأننا حذفنا رسم الاتجاه)
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, Filler)

// استدعاء الـ Stores
const responsesStore = useResponsesStore()
const questionsStore = useQuestionsStore()
const agenciesStore = useAgenciesStore()
const statsStore = useStatsStore()

const responses = computed(() => responsesStore.all)
const questions = computed(() => questionsStore.all)
const agencies = computed(() => agenciesStore.all)
const loading = computed(() => responsesStore.loading || questionsStore.loading || agenciesStore.loading || statsStore.loading)

// حالة المودال
const showResponseModal = ref(false)
const selectedResponse = ref(null)

// فلاتر إحصائيات الأسئلة
const selectedQuestionType = ref('')
const selectedAgency = ref('')
const selectedRating = ref('')

function openResponseModal(response) {
  selectedResponse.value = response
  showResponseModal.value = true
}

// التحديث التلقائي
let refreshInterval = null

const startAutoRefresh = () => {
  refreshInterval = setInterval(async () => {
    if (document.visibilityState === 'visible') {
      await refreshData()
    }
  }, 2 * 60 * 1000)
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

const handleVisibilityChange = async () => {
  if (document.visibilityState === 'visible') {
    await refreshData()
  }
}

// --- الحسابات والإحصائيات ---

// دالة مساعدة لجلب اسم الوكالة
const getAgencyName = (id) => {
  const agency = agenciesStore.byId(id)
  return agency ? agency.name : 'غير معروف'
}

// تعزيز كائنات الردود ببيانات الوكالة لسهولة الفلترة
const enrichedResponses = computed(() => {
  return responses.value.map(r => {
    // حاول الحصول على اسم الوكالة من الرد نفسه، أو ابحث عنه في الستور
    const agencyName = r.agencyName || r.agency_name || getAgencyName(r.agencyId || r.agency_id)
    return {
      ...r,
      agencyName 
    }
  })
})

const stats = computed(() => {
  const totalResponses = enrichedResponses.value.length
  const averageSatisfaction = totalResponses ? enrichedResponses.value.reduce((acc, r) => acc + calculateAverageRating(r), 0) / totalResponses : 0
  const completionRate = totalResponses ? Math.round((enrichedResponses.value.filter(r => r.completed !== false).length / totalResponses) * 100) : 0
  const npsScore = calculateNPS(enrichedResponses.value)

  // إحصائيات الوكالات
  const agencyStats = {}
  enrichedResponses.value.forEach(response => {
    const aId = response.agencyId || response.agency_id
    const aName = response.agencyName
    
    if (!agencyStats[aId]) {
      agencyStats[aId] = { name: aName, totalRating: 0, count: 0 }
    }
    agencyStats[aId].totalRating += calculateAverageRating(response)
    agencyStats[aId].count++
  })

  const agenciesArr = Object.values(agencyStats).map(agency => ({
    name: agency.name,
    average: agency.totalRating / agency.count,
    responses: agency.count
  }))

  const sortedAgencies = agenciesArr.sort((a, b) => b.average - a.average)
  const topAgencies = sortedAgencies.slice(0, 5)
  const lowestAgencies = sortedAgencies.slice(-5).reverse()

  return {
    totalResponses,
    averageSatisfaction,
    completionRate,
    npsScore,
    topAgencies,
    lowestAgencies
  }
})

// بيانات الرسوم البيانية
const ratingDistributionData = computed(() => {
  const distribution = [0, 0, 0, 0, 0]
  enrichedResponses.value.forEach(response => {
    const avgRating = calculateAverageRating(response)
    if (avgRating >= 1 && avgRating <= 5) {
      distribution[Math.floor(avgRating) - 1]++
    }
  })

  return {
    labels: ['1 نجمة', '2 نجوم', '3 نجوم', '4 نجوم', '5 نجوم'],
    datasets: [{
      label: 'عدد الردود',
      data: distribution,
      backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'],
      borderRadius: 8
    }]
  }
})

const categorySatisfactionData = computed(() => {
  // الأقسام الثلاثة المحددة
  const targetCategories = ['تذاكر', 'فنادق / تأشيرات', 'مالية']
  const categoryStats = {}
  // تجهيز نسخة مطابقة للأقسام (بدون فراغات وبأحرف صغيرة)
  const normalizedTargets = targetCategories.map(cat => cat.trim().toLowerCase())
  targetCategories.forEach(cat => {
    categoryStats[cat] = { total: 0, count: 0 }
  })

  enrichedResponses.value.forEach(response => {
    let category = response.department ? response.department.trim().toLowerCase() : ''
    const idx = normalizedTargets.indexOf(category)
    if (idx !== -1) {
      const realCat = targetCategories[idx]
      categoryStats[realCat].total += calculateAverageRating(response)
      categoryStats[realCat].count++
    }
  })

  const labels = Object.keys(categoryStats)
  const data = labels.map(cat => {
    const count = categoryStats[cat].count
    return count > 0 ? (categoryStats[cat].total / count).toFixed(1) : 0
  })

  return {
    labels,
    datasets: [{
      label: 'متوسط الرضا',
      data,
      backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6'],
      borderRadius: 8
    }]
  }
})

const npsDistributionData = computed(() => {
  let promoters = 0, passives = 0, detractors = 0
  enrichedResponses.value.forEach(response => {
    const nps = response.finalNps || response.final_nps || 0
    if (nps >= 9) promoters++
    else if (nps >= 7) passives++
    else detractors++
  })

  return {
    labels: ['مروجون', 'محايدون', 'منتقدون'],
    datasets: [{
      data: [promoters, passives, detractors],
      backgroundColor: ['#10b981', '#eab308', '#ef4444'],
      borderWidth: 0
    }]
  }
})

// إحصائيات الأسئلة مع الفلاتر (Logic Corrected)
const filteredQuestionsStats = computed(() => {
  let filteredQuestions = questions.value
  
  // 1. فلترة الأسئلة حسب النوع
  if (selectedQuestionType.value) {
    filteredQuestions = filteredQuestions.filter(q => q.type === selectedQuestionType.value)
  }

  return filteredQuestions.map(q => {
    // 2. فلترة الردود بناءً على الوكالة والتقييم المختارين
    let relevantResponses = enrichedResponses.value

    if (selectedAgency.value) {
      relevantResponses = relevantResponses.filter(r => r.agencyName === selectedAgency.value)
    }

    // إذا كان الفلتر تقييم، والأسئلة ليست من نوع تقييم، هذا الفلتر قد لا يكون منطقياً، لكن سنطبقه على أسئلة التقييم فقط
    if (selectedRating.value && q.type === 'rating') {
      relevantResponses = relevantResponses.filter(r => {
        if (!r.answers || !Array.isArray(r.answers)) return false
        const answer = r.answers.find(a => a.questionId == q.id || a.question == q.text)
        return answer && Number(answer.rating) === Number(selectedRating.value)
      })
    }

    // 3. استخراج الإجابات من الردود المفلترة
    const answersForQ = relevantResponses.map(r => {
      if (!r.answers || !Array.isArray(r.answers)) return null
      const found = r.answers.find(a => a.questionId == q.id || a.question == q.text)
      
      if (!found) return null

      // معالجة أسئلة التقييم لتحويل الأرقام لنص
      if (q.type === 'rating' && found.rating) {
         if (found.rating == 5) return 'ممتاز (5)'
         if (found.rating == 4) return 'جيد (4)'
         if (found.rating == 3) return 'محايد (3)'
         if (found.rating == 2) return 'مقبول (2)'
         if (found.rating == 1) return 'سيئ (1)'
         return found.rating
      }
      
      return found.text || found.choice || found.rating || ''
    }).filter(val => val !== null && val !== '')

    // 4. تجميع النتائج
    // بالنسبة للتقييم، نفضل عرض الخيارات الثابتة حتى لو كانت 0
    let optionsToCount = []
    if (q.type === 'rating') {
        optionsToCount = ['ممتاز (5)', 'جيد (4)', 'محايد (3)', 'مقبول (2)', 'سيئ (1)']
    } else {
        optionsToCount = [...new Set(answersForQ)]
    }
    
    const options = optionsToCount.map(optValue => ({
      value: optValue,
      count: answersForQ.filter(a => a == optValue).length
    }))

    return {
      id: q.id,
      text: q.text,
      options
    }
  })
})

const filteredRecentResponses = computed(() => {
  return [...enrichedResponses.value]
    .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
    .slice(0, 10)
})

// خيارات الرسوم البيانية
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#e5e7eb', font: { family: 'Cairo' } } },
    tooltip: { titleColor: '#fff', bodyColor: '#fff', titleFont: { family: 'Cairo' } }
  },
  scales: {
    y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
    x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { color: '#fff', font: { family: 'Cairo' } } }
  }
}

const calculateAverageRating = (response) => {
  if (!response.answers || !Array.isArray(response.answers)) return 0
  const ratings = response.answers
    .map(answer => answer.rating)
    .filter(rating => rating !== null && rating !== undefined && rating > 0)
  return ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0
}

const calculateNPS = (responses) => {
  if (!responses.length) return 0
  let promoters = 0, detractors = 0
  responses.forEach(r => {
    const nps = r.finalNps || r.final_nps || 0
    if (nps >= 9) promoters++
    else if (nps <= 6) detractors++
  })
  return Math.round(((promoters - detractors) / responses.length) * 100)
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'غير محدد'
  return new Date(dateStr).toLocaleString('ar-SA')
}

const refreshData = async () => {
  try {
    await Promise.all([
      responsesStore.fetchAll({ force: true }),
      questionsStore.fetchAll({ force: true }),
      agenciesStore.fetchAll({ force: true }),
      statsStore.fetchAll({ force: true })
    ])
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(async () => {
  await refreshData()
  startAutoRefresh()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  stopAutoRefresh()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
* {
  font-family: 'Cairo', sans-serif;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>