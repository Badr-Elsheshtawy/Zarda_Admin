<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white font-sans" dir="rtl">
    <div class="container mx-auto px-6 py-8">
      <PageHeader>
        <template #icon>
          <svg class="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </template>
        <template #title>كل الردود</template>
        <template #subtitle>عرض جميع ردود الاستبيانات مع التصفية والبحث</template>
      </PageHeader>

      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
        <div class="flex flex-wrap gap-3 mb-4 items-center">
          <input v-model="search" type="text" placeholder="ابحث بالوكالة أو الموظف أو القسم" class="flex-1 min-w-[240px] bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <select v-model="selectedAgency" class="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">كل الوكالات</option>
            <option v-for="a in agencies" :key="a.id" :value="a.name">{{ a.name }}</option>
          </select>
          <select v-model="selectedRating" class="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">كل التقييمات</option>
            <option v-for="n in 5" :key="n" :value="n">{{ n }}/5</option>
          </select>
        </div>

        <div v-if="loading" class="flex justify-center items-center py-20">
          <LoadingSpinner>جاري تحميل الردود...</LoadingSpinner>
        </div>

        <div v-else class="overflow-x-auto">
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
              <tr v-for="response in paged" :key="response.id" class="hover:bg-white/5 transition">
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <img :src="response.agencyLogo || (base + 'zarda_logo.png')" @error="onImgError" class="w-8 h-8 rounded-lg object-cover" />
                    <span>{{ response.agencyName }}</span>
                  </div>
                </td>
                <td class="p-4">{{ response.employee_name || response.employeeName || 'غير محدد' }}</td>
                <td class="p-4">{{ response.department || '-' }}</td>
                <td class="p-4">
                  <span class="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">{{ calculateAverageRating(response).toFixed(1) }}/5</span>
                </td>
                <td class="p-4">
                  <span :class="(response.finalNps || response.final_nps || 0) >= 9 ? 'bg-green-500/20 text-green-300' : (response.finalNps || response.final_nps || 0) >= 7 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'" class="px-2 py-1 rounded">
                    {{ response.finalNps || response.final_nps || 0 }}
                  </span>
                </td>
                <td class="p-4 text-gray-400">{{ formatDate(response.created_at || response.createdAt) }}</td>
                <td class="p-4">
                  <button @click="viewFilledSurvey(response)" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded transition text-sm">عرض</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="flex items-center justify-center gap-3 mt-6">
            <button :disabled="page===1" @click="page--" class="px-3 py-1 rounded bg-white/10 disabled:opacity-30">السابق</button>
            <span class="text-sm text-gray-300">صفحة {{ page }} من {{ totalPages }}</span>
            <button :disabled="page===totalPages" @click="page++" class="px-3 py-1 rounded bg-white/10 disabled:opacity-30">التالي</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useResponsesStore } from '@/stores/responses'
import { useAgenciesStore } from '@/stores/agencies'

const responsesStore = useResponsesStore()
const agenciesStore = useAgenciesStore()
const router = useRouter()
const base = import.meta.env.BASE_URL || '/'

const onImgError = (e) => {
  const fallback = base + 'zarda_logo.png'
  if (e?.target && e.target.src !== fallback) e.target.src = fallback
}

const loading = computed(() => responsesStore.loading || agenciesStore.loading)
const responses = computed(() => responsesStore.all)
const agencies = computed(() => agenciesStore.all)

const search = ref('')
const selectedAgency = ref('')
const selectedRating = ref('')
const page = ref(1)
const pageSize = 20

const formatDate = (dateStr) => {
  if (!dateStr) return 'غير محدد'
  return new Date(dateStr).toLocaleString('en-US')
}

const calculateAverageRating = (response) => {
  if (!response || response.answers == null) return 0

  let raw = response.answers
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw) } catch (e) { return 0 }
  }

  const answersArray = Array.isArray(raw)
    ? raw
    : (raw && typeof raw === 'object')
      ? Object.entries(raw).map(([questionId, ans]) => (ans && typeof ans === 'object' ? { questionId, ...ans } : { questionId, rating: ans }))
      : []

  const ratings = answersArray
    .map(a => {
      if (a && a.rating !== undefined && a.rating !== null) {
        const n = Number(a.rating)
        return Number.isFinite(n) ? n : null
      }
      const textLike = (a && (a.text || a.choice)) ? String(a.text || a.choice) : (typeof a === 'string' ? a : '')
      if (textLike) {
        const m = textLike.match(/([1-5])/)
        if (m) {
          const n = Number(m[1])
          if (n >= 1 && n <= 5) return n
        }
        const map = { 'ممتاز': 5, 'جيد': 4, 'محايد': 3, 'مقبول': 2, 'سيئ': 1 }
        const found = Object.keys(map).find(k => textLike.includes(k))
        if (found) return map[found]
      }
      if (typeof a === 'number') return a
      return null
    })
    .filter(n => n !== null && n >= 1 && n <= 5)

  if (!ratings.length) return 0
  return ratings.reduce((acc, n) => acc + n, 0) / ratings.length
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  let list = responses.value

  if (selectedAgency.value) {
    list = list.filter(r => (r.agencyName || '').toLowerCase() === selectedAgency.value.toLowerCase())
  }
  if (selectedRating.value) {
    list = list.filter(r => Math.round(calculateAverageRating(r)) === Number(selectedRating.value))
  }
  if (q) {
    list = list.filter(r =>
      (r.agencyName || '').toLowerCase().includes(q) ||
      (r.employee_name || r.employeeName || '').toLowerCase().includes(q) ||
      (r.department || '').toLowerCase().includes(q)
    )
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paged = computed(() => {
  if (page.value > totalPages.value) page.value = totalPages.value
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

const viewFilledSurvey = (response) => {
  router.push(`/survey/employee/${response.id}`)
}

onMounted(async () => {
  await Promise.all([
    responsesStore.fetchAll({ force: true }),
    agenciesStore.fetchAll({ force: true })
  ])
})
</script>

<style scoped>
</style>
