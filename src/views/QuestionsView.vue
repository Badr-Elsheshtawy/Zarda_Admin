<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex justify-between items-center border-b border-gray-700 pb-4">
      <h1 class="text-2xl font-bold text-white">❓ إدارة الأسئلة</h1>
      <button
        @click="showAddModal = true"
        class="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg shadow-lg font-bold flex items-center gap-2"
      >
        <span>➕</span> سؤال جديد
      </button>
    </div>

    <div class="flex gap-2 overflow-x-auto pb-2">
      <button
        v-for="cat in categories"
        :key="cat.value"
        @click="selectedCategory = cat.value"
        :class="[
          'px-4 py-2 rounded-lg transition whitespace-nowrap font-medium',
          selectedCategory === cat.value
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700',
        ]"
      >
        {{ cat.label }}
      </button>
    </div>

    <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
      <table class="w-full text-white">
        <thead class="bg-gray-900/50 text-gray-400 text-sm uppercase">
          <tr>
            <th class="text-right p-4">الترتيب</th>
            <th class="text-right p-4">نص السؤال</th>
            <th class="text-right p-4">الفئة</th>
            <th class="text-right p-4">النوع</th>
            <th class="text-right p-4">الإجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700">
          <tr v-for="question in filteredQuestions" :key="question.id" class="hover:bg-gray-700/30 transition">
            <td class="p-4 font-mono text-gray-400">#{{ question.order }}</td>
            <td class="p-4 font-medium">{{ question.text }}</td>
            <td class="p-4">
              <span :class="['px-2 py-1 rounded-md text-xs font-bold', getCategoryColor(question.category)]">
                {{ getCategoryName(question.category) }}
              </span>
            </td>
            <td class="p-4 text-sm text-gray-300">
              {{ question.type === 'Rating' ? '⭐ تقييم' : '📝 نص' }}
            </td>
            <td class="p-4">
              <div class="flex gap-2">
                <button @click="editQuestion(question)" class="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded-lg">✏️</button>
                <button @click="deleteQuestion(question.id)" class="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredQuestions.length === 0" class="text-center py-10 text-gray-500">
        لا توجد أسئلة في هذا القسم
      </div>
    </div>

    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-600 shadow-2xl overflow-hidden">
        <div class="p-5 border-b border-gray-700 bg-gray-900/50">
          <h2 class="text-xl font-bold text-white">{{ showEditModal ? 'تعديل السؤال' : 'إضافة سؤال جديد' }}</h2>
        </div>
        <form @submit.prevent="saveQuestion" class="p-6 space-y-4">
          <div>
            <label class="block text-gray-400 text-sm mb-1">نص السؤال</label>
            <textarea v-model="questionForm.text" class="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 outline-none" rows="3" required></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
               <label class="block text-gray-400 text-sm mb-1">الفئة</label>
               <select v-model="questionForm.category" class="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 outline-none" required>
                 <option v-for="cat in categories.slice(1)" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
               </select>
            </div>
            <div>
               <label class="block text-gray-400 text-sm mb-1">النوع</label>
               <select v-model="questionForm.type" class="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 outline-none" required>
                 <option value="Rating">تقييم (نجوم)</option>
                 <option value="Text">نص (كتابة)</option>
               </select>
            </div>
          </div>
          <div>
            <label class="block text-gray-400 text-sm mb-1">الترتيب</label>
            <input v-model="questionForm.order" type="number" class="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 outline-none" required />
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-bold">حفظ</button>
            <button type="button" @click="closeModal" class="px-5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuestionsStore } from '@/stores/questions'

const questionsStore = useQuestionsStore()
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedCategory = ref(null)
const questionForm = ref({ text: '', category: 'Flight', type: 'Rating', order: 1 })
const editingQuestion = ref(null)

const categories = [
  { label: 'الكل', value: null },
  { label: 'التذاكر', value: 'Flight' },
  { label: 'الفنادق / التأشيرات', value: 'HotelVisa' },
  { label: 'المالية', value: 'Finance' }
]

onMounted(() => questionsStore.fetchAll())

const filteredQuestions = computed(() => {
  if (!selectedCategory.value) return questionsStore.all
  return questionsStore.byCategory(selectedCategory.value)
})

const getCategoryName = (cat) => categories.find(c => c.value === cat)?.label || cat

const getCategoryColor = (cat) => {
  const map = {
    Flight: 'bg-blue-900/40 text-blue-400',
    // Hotel: 'bg-green-900/40 text-green-400',
    HotelVisa : 'bg-yellow-900/40 text-yellow-400',
    Finance: 'bg-red-900/40 text-red-400'
  }
  return map[cat] || 'bg-gray-700 text-gray-300'
}

const saveQuestion = async () => {
  try {
    const data = { ...questionForm.value }
    if (showEditModal.value) await questionsStore.update(editingQuestion.value.id, data)
    else await questionsStore.add(data)
    closeModal()
  } catch (error) { alert('حدث خطأ') }
}

const editQuestion = (q) => {
  editingQuestion.value = q
  questionForm.value = { ...q }
  showEditModal.value = true
}

const deleteQuestion = async (id) => {
  if(confirm('حذف السؤال؟')) await questionsStore.remove(id)
}

const closeModal = () => {
  showAddModal.value = false; showEditModal.value = false
  questionForm.value = { text: '', category: 'Flight', type: 'Rating', order: 1 }
}
</script>