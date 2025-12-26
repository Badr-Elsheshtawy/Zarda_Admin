<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex justify-between items-center border-b border-gray-700 pb-4">
      <div>
        <h1 class="text-2xl font-bold text-white">🏢 إدارة الوكالات</h1>
        <p class="text-gray-400 text-sm mt-1">إدارة الشركاء ومتابعة حالة الاستبيانات</p>
      </div>
      <button
        @click="showAddModal = true"
        class="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-blue-500/20 transition flex items-center gap-2 font-bold"
      >
        <span>➕</span> إضافة وكالة
      </button>
    </div>

    <div v-if="loadingData" class="text-center py-20">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
      <div class="overflow-x-auto">
        <table class="w-full text-white">
          <thead class="bg-gray-900/50 text-gray-400 text-sm uppercase">
            <tr>
              <th class="text-right p-4">الوكالة</th>
              <th class="text-right p-4">نسبة الإنجاز</th>
              <th class="text-right p-4">الردود</th>
              <th class="text-right p-4">الرابط</th>
              <th class="text-right p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr
              v-for="agency in agenciesWithResponses"
              :key="agency.id"
              class="hover:bg-gray-700/30 transition duration-150"
            >
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <img
                      :src="agency.logoUrl || '/placeholder-logo.png'"
                      class="w-12 h-12 rounded-lg object-cover bg-gray-900 border border-gray-600"
                      @error="$event.target.src = '/zarda_logo.png'"
                    />
                  </div>
                  <div>
                    <div class="font-bold text-gray-100">{{ agency.name }}</div>
                    <div class="text-xs text-gray-500">{{ agency.id.substring(0,6) }}...</div>
                  </div>
                </div>
              </td>
              <td class="p-4 align-middle w-1/4">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all duration-500"
                      :class="getProgressColor(agency.completionRate)"
                      :style="{ width: `${Math.min(agency.completionRate, 100)}%` }"
                    ></div>
                  </div>
                  <span class="text-xs font-bold w-8 text-left">{{ Math.round(agency.completionRate) }}%</span>
                </div>
              </td>
              <td class="p-4">
                <span
                  class="px-2.5 py-1 rounded-md text-xs font-bold"
                  :class="agency.currentResponses >= agency.targetEmployees ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'"
                >
                  {{ agency.currentResponses }} / {{ agency.targetEmployees }}
                </span>
              </td>
              <td class="p-4">
                <button 
                  @click="copyLink(agency.slug)"
                  class="group flex items-center gap-2 text-gray-400 hover:text-white bg-gray-900/50 hover:bg-blue-600 p-2 rounded-lg transition text-sm border border-gray-600 hover:border-blue-500"
                >
                  <span>🔗</span>
                  <span class="text-xs">نسخ الرابط</span>
                </button>
              </td>
              <td class="p-4">
                <div class="flex gap-2">
                  <button
                    @click="editAgency(agency)"
                    class="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition"
                    title="تعديل"
                  >
                    ✏️
                  </button>
                  <button 
                    @click="deleteAgency(agency.id)" 
                    class="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                    title="حذف"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Transition name="modal">
      <div
        v-if="showAddModal || showEditModal"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="closeModal"
      >
        <div class="bg-gray-800 rounded-2xl border border-gray-600 shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
          <div class="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
            <h2 class="text-xl font-bold text-white">
              {{ showEditModal ? '✏️ تعديل بيانات الوكالة' : '🏢 إضافة وكالة جديدة' }}
            </h2>
            <button @click="closeModal" class="text-gray-400 hover:text-white transition">✕</button>
          </div>
          
          <form @submit.prevent="saveAgency" class="p-6 space-y-5">
            <div>
              <label class="block text-gray-300 text-sm font-bold mb-2">اسم الوكالة</label>
              <input
                v-model="agencyForm.name"
                type="text"
                class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                placeholder="أدخل اسم الوكالة"
                required
              />
            </div>
            
            <div>
              <label class="block text-gray-300 text-sm font-bold mb-2">عدد الموظفين المستهدف</label>
              <input
                v-model="agencyForm.targetEmployees"
                type="number"
                min="1"
                class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:border-blue-500 outline-none transition"
                required
              />
              <p class="text-xs text-gray-500 mt-1">يستخدم لحساب نسبة الإنجاز</p>
            </div>

            <div class="bg-gray-700/30 p-4 rounded-xl border border-dashed border-gray-600 text-center">
              <label class="cursor-pointer block">
                <div v-if="previewUrl" class="mb-3">
                  <img :src="previewUrl" class="w-20 h-20 mx-auto rounded-full object-cover border-2 border-blue-500 shadow-lg" />
                </div>
                <div v-else class="mb-3">
                  <div class="w-20 h-20 mx-auto rounded-full bg-gray-700 flex items-center justify-center text-3xl">📷</div>
                </div>
                <span class="text-blue-400 font-bold hover:underline">اضغط لرفع الشعار</span>
                <input
                  @change="handleFileChange"
                  type="file"
                  accept="image/*"
                  class="hidden"
                />
              </label>
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="submit"
                :disabled="loading"
                class="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {{ loading ? 'جاري الحفظ...' : 'حفظ البيانات' }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <div v-if="toastMsg" class="fixed bottom-5 left-5 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce">
      {{ toastMsg }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAgenciesStore } from '@/stores/agencies'
import { useResponsesStore } from '@/stores/responses'
import axios from 'axios'
import { CLOUD_NAME, UPLOAD_PRESET } from '@/config/cloudinary'

const agenciesStore = useAgenciesStore()
const responsesStore = useResponsesStore()
const showAddModal = ref(false)
const showEditModal = ref(false)
const loading = ref(false)
const loadingData = ref(true)
const previewUrl = ref('')
const selectedFile = ref(null)
const toastMsg = ref('')

const agencyForm = ref({ name: '', targetEmployees: '', logoUrl: '', slug: '' })
const editingAgency = ref(null)

const agenciesWithResponses = computed(() => {
  return agenciesStore.all.map((agency) => {
    const responses = responsesStore.all.filter((r) => r.agencyId === agency.id).length
    const target = agency.targetEmployees || 1
    return {
      ...agency,
      currentResponses: responses,
      completionRate: (responses / target) * 100
    }
  })
})

onMounted(async () => {
  try {
    await Promise.all([agenciesStore.fetchAll(), responsesStore.fetchAll()])
  } finally {
    loadingData.value = false
  }
})

const getProgressColor = (rate) => {
  if (rate >= 100) return 'bg-green-500'
  if (rate >= 50) return 'bg-blue-500'
  return 'bg-yellow-500'
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => { previewUrl.value = e.target.result }
    reader.readAsDataURL(file)
  }
}

const uploadToCloudinary = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData)
  return res.data.secure_url
}

const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s]/g, '').replace(/\s+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 7)
}

const saveAgency = async () => {
  loading.value = true
  try {
    let logoUrl = agencyForm.value.logoUrl
    if (selectedFile.value) logoUrl = await uploadToCloudinary(selectedFile.value)

    const data = {
      name: agencyForm.value.name,
      targetEmployees: agencyForm.value.targetEmployees,
      logoUrl,
      slug: showEditModal.value ? agencyForm.value.slug : generateSlug(agencyForm.value.name),
    }

    if (showEditModal.value) {
      await agenciesStore.update(editingAgency.value.id, data)
      showToast('✅ تم تحديث بيانات الوكالة')
    } else {
      await agenciesStore.add(data)
      showToast('✅ تم إضافة الوكالة بنجاح')
    }
    closeModal()
  } catch (error) {
    console.error(error)
    alert('حدث خطأ أثناء الحفظ')
  } finally {
    loading.value = false
  }
}

const editAgency = (agency) => {
  editingAgency.value = agency
  agencyForm.value = { ...agency }
  previewUrl.value = agency.logoUrl
  showEditModal.value = true
}

const deleteAgency = async (id) => {
  if (confirm('⚠️ هل أنت متأكد؟ سيتم حذف الوكالة ورابط الاستبيان الخاص بها.')) {
    await agenciesStore.remove(id)
    showToast('🗑️ تم الحذف')
  }
}

const copyLink = (slug) => {
  const link = `https://feedback-survey.netlify.app/survey/${slug}`
  navigator.clipboard.writeText(link)
  showToast('📋 تم نسخ الرابط!')
}

const showToast = (msg) => {
  toastMsg.value = msg
  setTimeout(() => toastMsg.value = '', 3000)
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  agencyForm.value = { name: '', targetEmployees: '', logoUrl: '', slug: '' }
  previewUrl.value = ''
  selectedFile.value = null
  editingAgency.value = null
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>