<template>
  <div class="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
    
    <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-gray-400 to-blue-600"></div>
    <div class="absolute -top-20 -right-20 w-64 h-64 bg-blue-900/20 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-gray-700/20 rounded-full blur-3xl"></div>

    <div class="w-full max-w-lg relative z-10">
      
      <div v-if="store.loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-400">جاري التحميل...</p>
      </div>

      <div v-else-if="store.error" class="bg-red-900/30 border border-red-800 p-6 rounded-2xl text-center">
        <div class="text-4xl mb-4">⚠️</div>
        <h3 class="text-xl font-bold text-red-400 mb-2">عذراً</h3>
        <p class="text-gray-300">{{ store.error }}</p>
      </div>

      <div v-else class="bg-gray-800 border border-gray-700 shadow-2xl rounded-2xl overflow-hidden transition-all duration-500">
        
        <div v-if="store.step < 4" class="p-6 bg-gray-800 border-b border-gray-700 text-center relative">
          <div class="flex justify-center items-center gap-6 mb-4">
            <div class="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center border border-gray-600 p-1">
              <img :src="store.agency?.logoUrl" class="w-full h-full object-contain rounded-lg" />
            </div>
            <span class="text-gray-500 text-2xl font-light">×</span>
            <div class="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center border border-gray-600 p-1">
              <img src="/zarda_logo.png" class="w-full h-full object-contain rounded-lg" />
            </div>
          </div>
          <h2 class="text-lg font-bold text-gray-200">شراكة النجاح</h2>
          <p class="text-xs text-gray-500 mt-1">{{ store.agency?.name }}</p>
          
          <div class="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
            <div 
              class="h-full bg-blue-500 transition-all duration-500" 
              :style="{ width: `${(store.step / 4) * 100}%` }"
            ></div>
          </div>
        </div>

        <div v-if="store.step === 0" class="p-8 text-center animate-fade-in">
          <h1 class="text-2xl font-bold text-white mb-4">مرحباً بك 👋</h1>
          <p class="text-gray-400 mb-8 leading-relaxed">
            نسعى دائماً لتحسين خدماتنا. رأيك يهمنا جداً وسيصل للإدارة مباشرة. 
            الاستبيان لن يأخذ أكثر من دقيقتين.
          </p>
          
          <div class="space-y-4">
            <div class="text-right">
              <label class="block text-gray-400 text-sm mb-2 mr-1">اسمك (اختياري)</label>
              <input 
                v-model="store.employeeName" 
                type="text" 
                placeholder="اكتب اسمك هنا..."
                class="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition"
              />
            </div>
            <button 
              @click="store.step++"
              class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition transform active:scale-95"
            >
              ابدأ التقييم 🚀
            </button>
          </div>
        </div>

        <div v-if="store.step === 1" class="p-8 animate-fade-in">
          <h2 class="text-xl font-bold text-center mb-6">ما هو تخصصك؟</h2>
          <div class="grid grid-cols-2 gap-4">
            <button 
              v-for="dept in departments" 
              :key="dept.id"
              @click="selectDepartment(dept.id)"
              class="p-4 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl transition flex flex-col items-center gap-2 group"
            >
              <span class="text-3xl group-hover:scale-110 transition">{{ dept.icon }}</span>
              <span class="font-bold text-sm">{{ dept.name }}</span>
            </button>
          </div>
        </div>

        <div v-if="store.step === 2" class="p-6 animate-fade-in">
          <h2 class="text-center text-gray-400 text-sm mb-6">قسم {{ getDeptName(store.selectedDepartment) }}</h2>
          
          <div class="space-y-8">
            <div v-for="q in store.questions" :key="q.id" class="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
              <p class="font-bold text-lg mb-4 text-gray-100">{{ q.text }}</p>
              
              <div v-if="q.type === 'Rating'" class="flex justify-center gap-2 mb-4 flex-row-reverse">
                 <template v-for="star in 5" :key="star">
                    <button 
                      @click="setRating(q.id, star)"
                      class="text-3xl transition transform hover:scale-110 focus:outline-none"
                      :class="(store.answers[q.id]?.rating >= star) ? 'text-yellow-400' : 'text-gray-600'"
                    >
                      ★
                    </button>
                 </template>
              </div>

              <textarea 
                v-model="getTextAnswer(q.id).text"
                placeholder="ملاحظات إضافية (اختياري)..."
                class="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none h-20 resize-none"
              ></textarea>
            </div>
          </div>

          <div class="mt-8">
            <button 
              @click="store.step++"
              :disabled="!isStep2Valid"
              class="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition"
            >
              التالي
            </button>
          </div>
        </div>

        <div v-if="store.step === 3" class="p-8 text-center animate-fade-in">
          <h2 class="text-xl font-bold mb-2">سؤال أخير</h2>
          <p class="text-gray-400 mb-8">ما مدى احتمالية ترشيحك لشركتنا لزملاء آخرين؟</p>
          
          <div class="grid grid-cols-6 gap-2 mb-8" dir="ltr">
            <button 
              v-for="i in 11" 
              :key="i-1"
              @click="store.npsScore = i-1"
              class="w-full aspect-square rounded-lg font-bold border transition text-sm sm:text-base"
              :class="store.npsScore === (i-1) 
                ? 'bg-blue-600 border-blue-500 text-white scale-110 shadow-lg ring-2 ring-blue-400' 
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'"
            >
              {{ i-1 }}
            </button>
          </div>
          <div class="flex justify-between text-xs text-gray-500 px-1 mb-8">
            <span>0 - مستحيل</span>
            <span>10 - بالتأكيد</span>
          </div>

          <button 
            @click="store.submitSurvey"
            :disabled="store.npsScore === null"
            class="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 transition"
          >
            إرسال التقييم ✅
          </button>
        </div>

        <div v-if="store.step === 4" class="p-12 text-center animate-scale-in">
          <div class="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
            <span class="text-5xl">🎉</span>
          </div>
          <h2 class="text-3xl font-bold text-white mb-2">شكراً لك!</h2>
          <p class="text-gray-400 mb-8">تم استلام تقييمك بنجاح. نقدر وقتك وجهدك في مساعدتنا لنتطور.</p>
          <a href="https://your-website.com" class="text-blue-400 hover:underline">زيارة موقعنا الرئيسي</a>
        </div>

      </div>
      
      <p class="text-center text-gray-600 text-xs mt-6">Powered by Zarda Tech © 2025</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSurveyStore } from '@/stores/survey'

const route = useRoute()
const store = useSurveyStore()

const departments = [
  { id: 'Flight', name: 'تذاكر طيران', icon: '✈️' },
  { id: 'Hotel', name: 'حجوزات فنادق', icon: '🏨' },
  { id: 'Visa', name: 'تأشيرات', icon: '🛂' },
  { id: 'Finance', name: 'حسابات ومالية', icon: '💰' }
]

onMounted(() => {
  const slug = route.params.slug
  if (slug) {
    store.fetchAgencyBySlug(slug)
  } else {
    store.error = "رابط غير صالح"
  }
})

const selectDepartment = async (id) => {
  store.selectedDepartment = id
  await store.fetchQuestions()
  store.step = 2
}

const getDeptName = (id) => departments.find(d => d.id === id)?.name

const setRating = (qId, val) => {
  if (!store.answers[qId]) store.answers[qId] = { rating: 0, text: '' }
  store.answers[qId].rating = val
}

// Helper to safely access text model inside v-for
const getTextAnswer = (qId) => {
  if (!store.answers[qId]) store.answers[qId] = { rating: 0, text: '' }
  return store.answers[qId]
}

// Validation: Ensure all Rating questions have a value
const isStep2Valid = computed(() => {
  const ratingQuestions = store.questions.filter(q => q.type === 'Rating')
  return ratingQuestions.every(q => store.answers[q.id]?.rating > 0)
})
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.animate-scale-in { animation: scaleIn 0.4s ease-out; }
@keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>