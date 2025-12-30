<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
      <button class="absolute top-3 left-3 text-gray-500 hover:text-red-500" @click="$emit('close')">✕</button>
      <h2 class="text-xl font-bold mb-4 text-gray-800">تفاصيل استبيان الموظف</h2>
      <div v-if="response">
        <div class="mb-4 text-left">
          <button
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition font-semibold flex items-center gap-2"
            @click="openFullSurvey"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            عرض الاستبيان كاملاً
          </button>
        </div>
        <div class="mb-2"><span class="font-semibold">الاسم:</span> {{ response.employeeName || 'غير محدد' }}</div>
        <div class="mb-2"><span class="font-semibold">القسم:</span> {{ response.department || 'غير محدد' }}</div>
        <div class="mb-2"><span class="font-semibold">NPS:</span> {{ response.finalNps ?? 'غير محدد' }}</div>
        <div class="mb-4"><span class="font-semibold">تاريخ الإرسال:</span> {{ formatDate(response.timestamp) }}</div>
        <div>
          <h3 class="font-semibold mb-2">الإجابات:</h3>
          <ul class="space-y-2">
            <li v-for="(ans, idx) in response.answers" :key="idx" class="bg-gray-100 rounded p-3">
              <div class="mb-1"><span class="font-semibold">السؤال:</span> {{ ans.question }}</div>
              <div v-if="ans.rating !== undefined"><span class="font-semibold">التقييم:</span> {{ ans.rating }}</div>
              <div v-if="ans.text"><span class="font-semibold">الإجابة النصية:</span> {{ ans.text }}</div>
            </li>
          </ul>
        </div>
      </div>
      <div v-else class="text-center text-gray-500">لا توجد بيانات</div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter?.() // fallback for non-router context

function openFullSurvey() {
  const data = btoa(unescape(encodeURIComponent(JSON.stringify(response))))
  const slug = response.agencySlug || response.agencyId || ''
  const url = `/survey/${slug}?prefill=${data}`
  window.location.href = url
}
const props = defineProps({
  response: Object
})

function formatDate(ts) {
  if (!ts) return '—'
  if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString('ar-EG')
  if (typeof ts === 'string' || typeof ts === 'number') return new Date(ts).toLocaleString('ar-EG')
  return '—'
}
</script>

<style scoped>
</style>
