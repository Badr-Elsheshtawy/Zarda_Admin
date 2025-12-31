<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white font-sans" dir="rtl">
    <div class="container mx-auto px-6 py-8">
      <PageHeader>
        <template #icon>
          <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </template>
        <template #title>استبيان الموظف</template>
        <template #subtitle>عرض تفاصيل استبيان الموظف المملوء</template>
        <template #actions>
          <button
            @click="$router.back()"
            class="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-3 font-semibold transform hover:scale-105"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            العودة
          </button>
        </template>
      </PageHeader>

      <div v-if="loading" class="flex justify-center items-center py-20">
        <LoadingSpinner>جاري تحميل بيانات الاستبيان...</LoadingSpinner>
      </div>

      <div v-else-if="response" class="space-y-8">
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            معلومات الاستبيان
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white/5 rounded-xl p-4 border border-white/10">
              <div class="text-gray-400 text-sm mb-1">الموظف</div>
              <div class="text-white font-bold text-lg">{{ response.employee_name || response.employeeName || 'غير محدد' }}</div>
            </div>
            <div class="bg-white/5 rounded-xl p-4 border border-white/10">
              <div class="text-gray-400 text-sm mb-1">الوكالة</div>
              <div class="flex items-center gap-3">
                <img v-if="agencyLogo" :src="agencyLogo" @error="$event.target.style.display = 'none'" class="w-8 h-8 rounded-lg object-cover" />
                <div class="text-white font-bold text-lg">{{ agencyName }}</div>
              </div>
            </div>
            <div class="bg-white/5 rounded-xl p-4 border border-white/10">
              <div class="text-gray-400 text-sm mb-1">التاريخ</div>
              <div class="text-white font-bold text-lg">{{ formatDate(response.created_at) }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            الأسئلة والإجابات
          </h3>

          <div v-if="filteredQuestions.length > 0" class="space-y-6">
            <div v-for="(q, idx) in filteredQuestions" :key="q.id" class="bg-white/5 rounded-xl p-6 border border-white/10">
              <div class="mb-4">
                <div class="flex items-center gap-3 mb-2">
                  <span class="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-bold">{{ idx + 1 }}</span>
                  <span class="text-white font-bold text-lg">{{ q.text }}</span>
                </div>
                <div class="text-gray-400 text-sm">نوع السؤال: {{ getQuestionTypeLabel(q.type) }}</div>
              </div>

              <div class="mt-4">
                <div class="text-gray-300 text-sm mb-2">الإجابة:</div>
                <div v-if="q.type === 'rating'" class="flex gap-2">
                  <span v-for="star in 5" :key="star" class="text-3xl" :class="getAnswer(q.id) >= star ? 'text-yellow-400' : 'text-gray-600'">★</span>
                  <span class="text-white font-bold ml-4">({{ getAnswer(q.id) }}/5)</span>
                </div>
                <div v-else-if="q.type === 'text'" class="bg-gray-800/50 rounded-lg p-4 text-white min-h-[60px] leading-relaxed">
                  {{ getAnswer(q.id) || 'لم يتم الإجابة' }}
                </div>
                <div v-else-if="q.type === 'choice'" class="flex flex-wrap gap-3">
                  <span v-for="option in ['ممتاز', 'جيد', 'محايد', 'مقبول', 'سيئ']" :key="option"
                        class="px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all"
                        :class="getAnswer(q.id) === option ? 'bg-blue-600 text-white border-blue-600 scale-105' : 'bg-gray-700/50 border-gray-600 text-gray-300'">
                    {{ option }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12 text-gray-400">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            لا توجد أسئلة أو إجابات لهذا الاستبيان
          </div>
        </div>

        <div v-if="response.final_nps !== undefined && response.final_nps !== null" class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
            </svg>
            تقييم NPS (مؤشر رضا العملاء)
          </h3>
          <div class="text-center">
            <div class="text-6xl font-bold text-white mb-4">{{ response.final_nps }}</div>
            <div class="text-gray-300 mb-6">من مقياس 0-10</div>
            <div class="flex justify-center gap-2 flex-wrap">
              <span v-for="i in 11" :key="i" class="w-12 h-12 flex items-center justify-center rounded-full border-2 text-lg font-bold transition-all"
                    :class="response.final_nps === (i-1) ? 'bg-purple-600 text-white border-purple-600 scale-110 shadow-lg' : 'bg-gray-700/50 border-gray-600 text-gray-400'">
                {{ i-1 }}
              </span>
            </div>
            <div class="mt-6 text-sm text-gray-400">
              {{ getNPSDescription(response.final_nps) }}
            </div>
          </div>
        </div>

        <div v-if="response.complaints || (response.complaint_images && response.complaint_images.length > 0)" class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            الشكاوى والمقترحات
          </h3>

          <div v-if="response.complaints" class="mb-6">
            <div class="text-gray-300 text-sm mb-2">نص الشكوى:</div>
            <div class="bg-gray-800/50 rounded-lg p-4 text-white leading-relaxed">
              {{ response.complaints }}
            </div>
          </div>

          <div v-if="response.complaint_images && response.complaint_images.length > 0" class="mb-6">
            <div class="text-gray-300 text-sm mb-3">الصور المرفقة:</div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div v-for="(imageUrl, index) in response.complaint_images" :key="index" class="relative group">
                <img
                  :src="imageUrl"
                  class="w-full h-32 object-cover rounded-lg border border-white/10 hover:border-white/30 transition cursor-pointer"
                  @click="openImageModal(imageUrl)"
                  @error="$event.target.style.display = 'none'"
                />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition rounded-lg flex items-center justify-center pointer-events-none">
                  <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20 text-gray-400">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="text-xl font-bold mb-2">الاستبيان غير موجود</h3>
        <p>لم يتم العثور على الاستبيان المطلوب</p>
      </div>

      <transition name="fade">
        <div 
          v-if="showImageModal" 
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" 
          @click.self="closeImageModal"
        >
          <button 
            @click="closeImageModal" 
            class="absolute top-4 right-4 text-white hover:text-gray-300 transition p-2 bg-white/10 rounded-full z-50 hover:bg-white/20"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <button 
            @click="downloadImage" 
            class="absolute top-4 left-4 text-white hover:text-gray-300 transition p-2 bg-white/10 rounded-full z-50 hover:bg-white/20" 
            title="حفظ الصورة"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
          </button>

          <div class="relative max-w-full max-h-full flex items-center justify-center p-4">
            <img 
              :src="selectedImage" 
              class="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl" 
              @click.stop 
            />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import PageHeader from '@/components/PageHeader.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()

const response = ref(null)
const questions = ref([])
const agencyName = ref('')
const agencyLogo = ref('')
const loading = ref(true)
const showImageModal = ref(false)
const selectedImage = ref('')

const filteredQuestions = computed(() => {
  if (!questions.value || !response.value || !response.value.answers) return []
  const answers = response.value.answers

  let answeredIds = []
  if (Array.isArray(answers)) {
    answeredIds = answers.map(a => a.questionId?.toString())
  } else if (typeof answers === 'object' && answers !== null) {
    answeredIds = Object.keys(answers)
  }

  return questions.value.filter(q => answeredIds.includes(q.id?.toString()))
})

const formatDate = (date) => {
  if (!date) return 'غير محدد'
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getQuestionTypeLabel = (type) => {
  const labels = {
    'text': 'نصي',
    'choice': 'اختيار من متعدد',
    'rating': 'تقييم نجوم'
  }
  return labels[type] || type
}

const getAnswer = (questionId) => {
  if (!response.value || !response.value.answers) return ''
  const answers = response.value.answers

  if (Array.isArray(answers)) {
    const found = answers.find(a => a.questionId == questionId || a.questionId == String(questionId) || a.questionId == Number(questionId))
    if (!found) return ''

    const q = questions.value.find(q => q.id == questionId || q.id == String(questionId) || q.id == Number(questionId))
    if (!q) return found.text ?? found.rating ?? found.choice ?? ''

    if (q.type === 'choice' || q.type === 'text') return found.text ?? ''
    if (q.type === 'rating') return found.rating ?? ''
    return found.text ?? found.rating ?? found.choice ?? ''
  } else if (typeof answers === 'object' && answers !== null) {
    let ans = answers[questionId]
    if (ans === undefined) ans = answers[String(questionId)]
    if (ans === undefined) ans = answers[Number(questionId)]

    if (typeof ans === 'object' && ans !== null) {
      const q = questions.value.find(q => q.id == questionId || q.id == String(questionId) || q.id == Number(questionId))
      if (!q) return ans.text ?? ans.rating ?? ans.choice ?? ''

      if (q.type === 'choice' || q.type === 'text') return ans.text ?? ''
      if (q.type === 'rating') return ans.rating ?? ''
      return ans.text ?? ans.rating ?? ans.choice ?? ''
    }

    if (typeof ans === 'string' || typeof ans === 'number') {
      return ans
    }
    return ans ?? ''
  }
  return ''
}

const getNPSDescription = (score) => {
  if (score >= 9) return 'راضي - عميل راضي جداً عن الخدمة'
  if (score >= 7) return 'محايد - عميل راضي لكنه غير متحمس'
  if (score >= 4) return 'غير راضي - عميل غير راضي عن الخدمة'
  if (score >= 0) return 'منتقد - عميل غير راضي وقد تفقد تعاونك معه'

  return 'غير محدد'
}

const openImageModal = (imageUrl) => {
  selectedImage.value = imageUrl
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
  selectedImage.value = ''
}

const downloadImage = async () => {
  try {
    const response = await fetch(selectedImage.value)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'complaint-image.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading image:', error)
    alert('حدث خطأ في تحميل الصورة')
  }
}

onMounted(async () => {
  const id = route.params.id
  if (!id) {
    loading.value = false
    return
  }

  try {
    const { data: resp, error: respError } = await supabase
      .from('responses')
      .select('*')
      .eq('id', id)
      .single()

    if (respError) throw respError
    response.value = resp

    if (resp && resp.agency_id) {
      const { data: agency, error: agencyError } = await supabase
        .from('agencies')
        .select('name, logo_url')
        .eq('id', resp.agency_id)
        .single()

      if (!agencyError) {
        agencyName.value = agency?.name || ''
        agencyLogo.value = agency?.logo_url || ''
      }
    }

    const { data: qs, error: qsError } = await supabase
      .from('questions')
      .select('*')
      .order('order', { ascending: true })

    if (!qsError) {
      questions.value = qs
    }
  } catch (error) {
    console.error('Error loading survey:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.min-h-\[60px\] { min-height: 60px; }

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>