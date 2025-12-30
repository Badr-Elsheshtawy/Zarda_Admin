<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white font-sans" dir="rtl">
    <div class="container mx-auto px-6 py-8">
      <PageHeader>
        <template #icon>
          <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </template>
        <template #title>إدارة الأسئلة</template>
        <template #subtitle>إضافة وتعديل أسئلة الاستبيانات</template>
        <template #actions>
          <button
            @click="showAddModal = true"
            class="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-3 font-semibold transform hover:scale-105"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            إضافة سؤال جديد
          </button>
        </template>
      </PageHeader>

      <div v-if="loading" class="flex justify-center items-center py-20">
        <LoadingSpinner>جاري تحميل الأسئلة...</LoadingSpinner>
      </div>

      <div v-else class="space-y-8">
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div class="flex flex-wrap gap-4 items-center">
            <div class="flex-1 min-w-64">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="البحث في الأسئلة..."
                class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition"
              >
            </div>
            <select
              v-model="filterCategory"
              class="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition"
            >
              <option value="">جميع الفئات</option>
              <option value="تذاكر">تذاكر</option>
              <option value="فنادق و تأشيرات">فنادق و تأشيرات</option>
              <option value="مالية">مالية</option>
              
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="question in filteredQuestions"
            :key="question.id"
            class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl hover:border-white/30 transition-all duration-300 group"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <span class="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{{ question.category }}</span>
                </div>
              </div>
              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="editQuestion(question)"
                  class="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition"
                >
                  <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button
                  @click="deleteQuestion(question.id)"
                  class="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition"
                >
                  <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>

            <h3 class="text-lg font-semibold text-white mb-3 line-clamp-2">{{ question.text }}</h3>

            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm text-gray-300">
                <span>النوع:</span>
                <span class="bg-gray-700/50 px-2 py-1 rounded">{{ question.type === 'rating' ? 'تقييم' : question.type === 'text' ? 'نص' : 'اختيار' }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-300">
                <span>الوزن:</span>
                <span class="text-blue-400">{{ question.weight || 1 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredQuestions.length === 0" class="text-center py-20">
          <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="text-xl font-semibold text-gray-400 mb-2">لا توجد أسئلة</h3>
          <p class="text-gray-500">ابدأ بإضافة أول سؤال للاستبيان</p>
        </div>
      </div>

      <Modal :show="showAddModal" @close="showAddModal = false" title="إضافة سؤال جديد">
        <form @submit.prevent="addQuestion" class="space-y-6">
          <div>
            <label class="block text-gray-300 mb-2">نص السؤال</label>
            <textarea
              v-model="newQuestion.text"
              required
              rows="3"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
              placeholder="اكتب السؤال هنا..."
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-300 mb-2">الفئة</label>
              <select
                v-model="newQuestion.category"
                required
                class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
              >
                <option value="تذاكر">تذاكر</option>
                <option value="فنادق و تأشيرات">فنادق / تأشيرات</option>
                <option value="مالية">مالية</option>
              </select>
            </div>

            <div>
              <label class="block text-gray-300 mb-2">نوع السؤال</label>
              <select
                v-model="newQuestion.type"
                required
                class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
              >
                <option value="rating">تقييم (1-5)</option>
                <option value="text">نص حر</option>
                <option value="choice">اختيار متعدد</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-gray-300 mb-2">الوزن (أهمية السؤال)</label>
            <input
              v-model.number="newQuestion.weight"
              type="number"
              min="1"
              max="10"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
            >
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition disabled:opacity-50"
            >
              {{ loading ? 'جاري الإضافة...' : 'إضافة السؤال' }}
            </button>
            <button
              type="button"
              @click="showAddModal = false"
              class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </Modal>

      <Modal :show="showEditModal" @close="showEditModal = false" title="تعديل السؤال">
        <form @submit.prevent="updateQuestion" class="space-y-6">
          <div>
            <label class="block text-gray-300 mb-2">نص السؤال</label>
            <textarea
              v-model="editQuestionData.text"
              required
              rows="3"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-300 mb-2">الفئة</label>
              <select
                v-model="editQuestionData.category"
                required
                class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
              >
                <option value="تذاكر">تذاكر</option>
                <option value="فنادق و تأشيرات">فنادق / تأشيرات</option>
                <option value="مالية">مالية</option>
              </select>
            </div>

            <div>
              <label class="block text-gray-300 mb-2">نوع السؤال</label>
              <select
                v-model="editQuestionData.type"
                required
                class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
              >
                <option value="rating">تقييم (1-5)</option>
                <option value="text">نص حر</option>
                <option value="choice">اختيار متعدد</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-gray-300 mb-2">الوزن (أهمية السؤال)</label>
            <input
              v-model.number="editQuestionData.weight"
              type="number"
              min="1"
              max="10"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
            >
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition disabled:opacity-50"
            >
              {{ loading ? 'جاري التحديث...' : 'تحديث السؤال' }}
            </button>
            <button
              type="button"
              @click="showEditModal = false"
              class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuestionsStore } from '@/stores/questions'
import PageHeader from '@/components/PageHeader.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Modal from '@/components/Modal.vue'

const questionsStore = useQuestionsStore()
const showAddModal = ref(false)
const showEditModal = ref(false)
const searchQuery = ref('')
const filterCategory = ref('')
const loading = computed(() => questionsStore.loading)

const newQuestion = ref({
  text: '',
  category: 'General',
  type: 'rating',
  weight: 1
})

const editQuestionData = ref({
  id: null,
  text: '',
  category: 'General',
  type: 'rating',
  weight: 1
})

const filteredQuestions = computed(() => {
  let questions = questionsStore.all

  if (searchQuery.value) {
    questions = questions.filter(q =>
      q.text.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (filterCategory.value) {
    questions = questions.filter(q => q.category === filterCategory.value)
  }

  return questions
})

const addQuestion = async () => {
  try {
    await questionsStore.add(newQuestion.value)
    showAddModal.value = false
    newQuestion.value = {
      text: '',
      category: 'General',
      type: 'rating',
      weight: 1
    }
  } catch (error) {
    console.error('Error adding question:', error)
  }
}

const editQuestion = (question) => {
  editQuestionData.value = { ...question }
  showEditModal.value = true
}

const updateQuestion = async () => {
  try {
    await questionsStore.update(editQuestionData.value.id, editQuestionData.value)
    showEditModal.value = false
  } catch (error) {
    console.error('Error updating question:', error)
  }
}

const deleteQuestion = async (id) => {
  if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
    try {
      await questionsStore.remove(id)
    } catch (error) {
      console.error('Error deleting question:', error)
    }
  }
}

onMounted(() => {
  questionsStore.fetchAll()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

