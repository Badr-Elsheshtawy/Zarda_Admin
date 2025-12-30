<script setup>
// ...existing code...

const isAddOpen = ref(false)
function closeAdd() {
  isAddOpen.value = false
}
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { useAdminPackagesStore } from '@/stores/packages'
import { CLOUD_NAME, UPLOAD_PRESET, UPLOAD_FOLDER } from '@/config/cloudinary'
import PageHeader from '@/components/PageHeader.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Modal from '@/components/Modal.vue'


const isLoggedIn = ref(false)
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref('')
const checkingAuth = ref(true)

const form = ref({
  title: '', price: '', currency: 'USD', category: 'سياحة', destination: '', description: '', isFeatured: false, active: true
})
const imageFiles = ref([])
const imageUrls = ref([])
const primaryImageIndex = ref(0)
const loading = ref(false)
const message = ref('')
const store = useAdminPackagesStore()

const isEditOpen = ref(false)
const editingId = ref(null)
const editForm = ref({
  title: '', price: '', currency: 'USD', category: 'سياحة', destination: '', description: '', isFeatured: false, active: true, image: ''
})
const primaryEditIndex = ref(0)

const showAdvancedFilters = ref(false)

const searchQuery = ref('')
const filterCategory = ref('')
const filterFeatured = ref(false)
const filterActive = ref('')
const filterDateFrom = ref('')
const filterDateTo = ref('')
const filterPriceMin = ref('')
const filterPriceMax = ref('')
const sortBy = ref('newest')

const displayedPackages = computed(() => {
  let list = [...store.all]

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(p => {
      const title = (p.title || '').toLowerCase()
      const dest = (p.destination || '').toLowerCase()
      const desc = (p.description || '').toLowerCase()
      return title.includes(q) || dest.includes(q) || desc.includes(q)
    })
  }

  if (filterCategory.value) {
    list = list.filter(p => p.category === filterCategory.value)
  }

  if (filterFeatured.value) {
    list = list.filter(p => !!p.isFeatured)
  }

  if (filterActive.value !== '') {
    const isActive = filterActive.value === 'true'
    list = list.filter(p => (p.active !== false) === isActive)
  }

  if (filterPriceMin.value) {
    const min = Number(filterPriceMin.value)
    list = list.filter(p => Number(p.price) >= min)
  }

  if (filterPriceMax.value) {
    const max = Number(filterPriceMax.value)
    list = list.filter(p => Number(p.price) <= max)
  }

  if (filterDateFrom.value) {
    const fromDate = new Date(filterDateFrom.value)
    list = list.filter(p => {
      const pkgDate = p.createdAt?.toDate?.() || new Date(p.createdAt?.seconds * 1000)
      return pkgDate >= fromDate
    })
  }

  if (filterDateTo.value) {
    const toDate = new Date(filterDateTo.value)
    toDate.setHours(23, 59, 59, 999)
    list = list.filter(p => {
      const pkgDate = p.createdAt?.toDate?.() || new Date(p.createdAt?.seconds * 1000)
      return pkgDate <= toDate
    })
  }

  const by = sortBy.value
  list.sort((a, b) => {
    switch (by) {
      case 'price-asc':
        return (Number(a.price) || 0) - (Number(b.price) || 0)
      case 'price-desc':
        return (Number(b.price) || 0) - (Number(a.price) || 0)
      case 'title-asc':
        return String(a.title || '').localeCompare(String(b.title || ''))
      case 'title-desc':
        return String(b.title || '').localeCompare(String(a.title || ''))
      case 'newest':
      default: {
        const ta = a.createdAt?.seconds || 0
        const tb = b.createdAt?.seconds || 0
        return tb - ta
      }
    }
  })

  return list
})

const handleLogin = async () => {
  loginError.value = ''
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.value,
      password: loginPassword.value
    })
    if (error) throw error
    isLoggedIn.value = true
    fetchPackages()
  } catch (err) {
    loginError.value = 'بيانات الدخول غير صحيحة!'
    console.error(err)
  }
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  isLoggedIn.value = false
}

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  isLoggedIn.value = !!session
  checkingAuth.value = false
  if (isLoggedIn.value) fetchPackages()
  supabase.auth.onAuthStateChange((_event, session) => {
    isLoggedIn.value = !!session
    if (isLoggedIn.value) fetchPackages()
  })
})

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  if(files.length === 0) return
  files.forEach(file => {
    imageFiles.value.push(file)
    imageUrls.value.push(URL.createObjectURL(file))
  })
  if (imageUrls.value.length > 0 && (primaryImageIndex.value == null || primaryImageIndex.value < 0)) {
    primaryImageIndex.value = 0
  }
}

const removeImage = (index) => {
  imageFiles.value.splice(index, 1)
  imageUrls.value.splice(index, 1)
  if (primaryImageIndex.value === index) {
    primaryImageIndex.value = Math.max(0, primaryImageIndex.value - 1)
  } else if (primaryImageIndex.value > index) {
    primaryImageIndex.value = primaryImageIndex.value - 1
  }
  if (primaryEditIndex.value === index) {
    primaryEditIndex.value = Math.max(0, primaryEditIndex.value - 1)
  } else if (primaryEditIndex.value > index) {
    primaryEditIndex.value = primaryEditIndex.value - 1
  }
}

const uploadImagesToCloudinary = async () => {
  const uploadedUrls = []
  for (const file of imageFiles.value) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', UPLOAD_FOLDER)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok || !data.secure_url) {
      const msg = data?.error?.message || 'فشل رفع الصورة إلى Cloudinary'
      throw new Error(msg)
    }
    uploadedUrls.push(data.secure_url)
  }
  return uploadedUrls
}

const addPackage = async () => {
  if (!form.value.title || !form.value.price) { alert('الرجاء تعبئة البيانات!'); return }
  loading.value = true; message.value = 'جاري الرفع...'
  try {
    let finalImageLinks = []
    if (imageFiles.value.length > 0) finalImageLinks = await uploadImagesToCloudinary()
    
    await store.add({
      ...form.value,
      price: Number(form.value.price),
      images: finalImageLinks,
      image: finalImageLinks[primaryImageIndex.value] ?? finalImageLinks[0] ?? '',
      views: 0
    })
    message.value = '✅ تم النشر!'
    form.value = { title: '', price: '', currency: 'USD', category: 'سياحة', destination: '', description: '', isFeatured: false, active: true }
    imageFiles.value = []; imageUrls.value = []
    isAddOpen.value = false
  } catch (err) { message.value = '❌ خطأ: ' + err.message } 
  finally { loading.value = false }
}

const fetchPackages = async () => { await store.fetchAll({ force: true }) }

const deletePackage = async (id) => {
  if(!confirm('هل أنت متأكد من حذف العرض؟')) return
  await store.remove(id)
}

const toggleActive = async (pkg) => {
  try {
    const next = await store.toggleActive(pkg.id, pkg.active)
    pkg.active = next
  } catch (e) {
    alert('تعذّر تغيير حالة التفعيل')
    console.error(e)
  }
}

const openEdit = (pkg) => {
  editingId.value = pkg.id
  isEditOpen.value = true
  editForm.value = {
    title: pkg.title || '',
    price: pkg.price ?? '',
    currency: pkg.currency || 'USD',
    category: pkg.category || 'سياحة',
    destination: pkg.destination || '',
    description: pkg.description || '',
    isFeatured: !!pkg.isFeatured,
    active: typeof pkg.active === 'boolean' ? pkg.active : true,
    image: pkg.image || ''
  }
  imageFiles.value = []
  imageUrls.value = Array.isArray(pkg.images) && pkg.images.length ? [...pkg.images] : (pkg.image ? [pkg.image] : [])
  const idx = imageUrls.value.findIndex(u => u === (pkg.image || ''))
  primaryEditIndex.value = idx !== -1 ? idx : 0
}

const saveEdit = async () => {
  if (!editingId.value) return
  loading.value = true
  message.value = 'جاري حفظ التعديلات...'
  try {
    let finalImageLinks = []
    if (imageFiles.value.length > 0) {
      finalImageLinks = await uploadImagesToCloudinary()
    } else {
      finalImageLinks = Array.isArray(imageUrls.value) ? imageUrls.value.filter(Boolean) : []
    }

    await store.update(editingId.value, {
      ...editForm.value,
      price: Number(editForm.value.price),
      images: finalImageLinks,
      image: (finalImageLinks.length ? (finalImageLinks[primaryEditIndex.value] ?? finalImageLinks[0]) : (editForm.value.image || ''))
    })

    message.value = '✅ تم حفظ التعديلات!'
    isEditOpen.value = false
    editingId.value = null
    imageFiles.value = []
    imageUrls.value = []
  } catch (err) {
    message.value = '❌ خطأ: ' + err.message
  } finally {
    loading.value = false
  }
}

const openAdd = () => {
  isAddOpen.value = true
  form.value = { title: '', price: '', currency: 'USD', category: 'سياحة', destination: '', description: '', isFeatured: false, active: true }
  imageFiles.value = []
  imageUrls.value = []
  message.value = ''
}

const exportData = () => {
  const data = store.all.map(pkg => ({
    title: pkg.title,
    price: pkg.price,
    currency: pkg.currency,
    category: pkg.category,
    destination: pkg.destination,
    description: pkg.description,
    isFeatured: pkg.isFeatured,
    active: pkg.active,
    views: pkg.views || 0,
    createdAt: pkg.createdAt?.toDate?.() || new Date()
  }))
  
  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `packages-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

const clearFilters = () => {
  searchQuery.value = ''
  filterCategory.value = ''
  filterFeatured.value = false
  filterActive.value = ''
  filterDateFrom.value = ''
  filterDateTo.value = ''
  filterPriceMin.value = ''
  filterPriceMax.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white font-sans" dir="rtl">
    
    <div v-if="checkingAuth" class="flex justify-center items-center h-screen">
      <LoadingSpinner>جاري التحقق من الهوية...</LoadingSpinner>
    </div>

    <div v-else-if="!isLoggedIn" class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl w-full max-w-md overflow-hidden">
        <div class="p-8 border-b border-white/20">
          <div class="text-center mb-8">
            <img src="/zarda_logo.png" alt="Zarda" class="mx-auto h-16 w-auto mb-4" @error="(e) => e.target.src = '/zarda_logo.png'">
            <h1 class="text-3xl font-bold text-white mb-2">Zarda Admin</h1>
            <p class="text-slate-300">لوحة التحكم الإدارية</p>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="p-8 space-y-6">
          <div>
            <label class="block text-slate-200 text-sm font-semibold mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
              </svg>
              البريد الإلكتروني
            </label>
            <input
              v-model="loginEmail"
              type="email"
              required
              class="w-full bg-white/10 border border-white/20 text-white rounded-xl p-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 placeholder-slate-400"
              placeholder="أدخل البريد الإلكتروني"
            />
          </div>
          <div>
            <label class="block text-slate-200 text-sm font-semibold mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              كلمة المرور
            </label>
            <input
              v-model="loginPassword"
              type="password"
              required
              class="w-full bg-white/10 border border-white/20 text-white rounded-xl p-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 placeholder-slate-400"
              placeholder="أدخل كلمة المرور"
            />
          </div>

          <div v-if="loginError" class="text-red-400 text-center text-sm font-semibold bg-red-500/10 border border-red-400/20 rounded-lg p-3">
            {{ loginError }}
          </div>

          <button
            type="submit"
            class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>

    <div v-else>
      <div class="container mx-auto px-6 py-8">
        <PageHeader>
          <template #icon>
            <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </template>
          <template #title>إدارة العروض</template>
          <template #subtitle>إدارة العروض السياحية والحجوزات</template>
          <template #actions>
            <button
              @click="exportData"
              class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all duration-300 flex items-center gap-3 font-semibold transform hover:scale-105"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              تصدير البيانات
            </button>
            <button
              @click="openAdd"
              class="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-3 font-semibold transform hover:scale-105"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              إضافة عرض جديد
            </button>
          </template>
        </PageHeader>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="md:col-span-2">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input v-model="searchQuery" type="text" placeholder="بحث بالعنوان/الوجهة/التفاصيل..." class="w-full bg-white/10 border border-white/20 text-white rounded-xl p-4 pl-10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 placeholder-slate-400" />
              </div>
            </div>
            <div>
              <select v-model="filterCategory" class="w-full bg-white/10 border border-white/20 text-white rounded-xl p-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200">
                <option value="" class="bg-slate-800">الكل</option>
                <option value="سياحة" class="bg-slate-800">سياحة</option>
                <option value="تأشيرات" class="bg-slate-800">تأشيرة</option>
                <option value="طيران" class="bg-slate-800">طيران</option>
              </select>
            </div>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input v-model="filterFeatured" type="checkbox" class="accent-yellow-500 w-4 h-4">
                مميز فقط
              </label>
              <button
                @click="showAdvancedFilters = !showAdvancedFilters"
                class="text-slate-300 hover:text-white transition-colors p-2"
                :title="showAdvancedFilters ? 'إخفاء الفلاتر المتقدمة' : 'إظهار الفلاتر المتقدمة'"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                </svg>
              </button>
            </div>
            <div>
              <select v-model="sortBy" class="w-full bg-white/10 border border-white/20 text-white rounded-xl p-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200">
                <option value="newest" class="bg-slate-800">الأحدث أولاً</option>
                <option value="price-asc" class="bg-slate-800">السعر: تصاعدي</option>
                <option value="price-desc" class="bg-slate-800">السعر: تنازلي</option>
                <option value="title-asc" class="bg-slate-800">العنوان: أ-ي</option>
                <option value="title-desc" class="bg-slate-800">العنوان: ي-أ</option>
              </select>
            </div>
          </div>

          <Transition name="slide" v-if="showAdvancedFilters">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <label class="block text-slate-300 text-sm mb-2">الحالة</label>
                <select v-model="filterActive" class="w-full bg-white/10 border border-white/20 text-white rounded-xl p-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200">
                  <option value="" class="bg-slate-800">الكل</option>
                  <option value="true" class="bg-slate-800">نشط</option>
                  <option value="false" class="bg-slate-800">غير نشط</option>
                </select>
              </div>
              <div>
                <label class="block text-slate-300 text-sm mb-2">السعر من</label>
                <input v-model="filterPriceMin" type="number" placeholder="0" class="w-full bg-white/10 border border-white/20 text-white rounded-xl p-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 placeholder-slate-400" />
              </div>
              <div>
                <label class="block text-slate-300 text-sm mb-2">السعر إلى</label>
                <input v-model="filterPriceMax" type="number" placeholder="10000" class="w-full bg-white/10 border border-white/20 text-white rounded-xl p-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 placeholder-slate-400" />
              </div>
              <div>
                <label class="block text-slate-300 text-sm mb-2">التاريخ من</label>
                <input v-model="filterDateFrom" type="date" class="w-full bg-white/10 border border-white/20 text-white rounded-xl p-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200" />
              </div>
              <div>
                <label class="block text-slate-300 text-sm mb-2">التاريخ إلى</label>
                <input v-model="filterDateTo" type="date" class="w-full bg-white/10 border border-white/20 text-white rounded-xl p-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200" />
              </div>
            </div>
          </Transition>

        <Transition name="modal">
          <Modal :show="isAddOpen" @close="closeAdd">
            <template #icon>
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </template>
            <template #title>إضافة عرض جديد</template>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            </div>
            <div class="mt-8 flex gap-4">
              <button @click="addPackage" :disabled="loading" class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-3">
                <svg v-if="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                </svg>
                <div v-if="loading" class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                {{ loading ? 'جاري النشر...' : 'نشر العرض' }}
              </button>
              <button @click="closeAdd" class="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all duration-200">
                إلغاء
              </button>
            </div>
            <div v-if="message" class="mt-6 text-center p-4 rounded-xl" :class="message.includes('✅') ? 'bg-green-500/10 border border-green-400/20 text-green-400' : 'bg-red-500/10 border border-red-400/20 text-red-400'">
              {{ message }}
            </div>
          </Modal>
        </Transition>

      <div class="space-y-6 pb-20">
        <div v-if="displayedPackages.length === 0" class="text-center py-16">
          <svg class="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-5v2m0 0v2m0-2h2m-2 0H8"></path>
          </svg>
          <h3 class="text-xl font-semibold text-slate-300 mb-2">لا توجد عروض منشورة</h3>
          <p class="text-slate-400">ابدأ بإضافة عرض جديد لتظهر هنا</p>
        </div>

        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="pkg in displayedPackages" :key="pkg.id" class="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden hover:shadow-blue-500/10 transition-all duration-300 group">
            <div class="relative">
              <img :src="pkg.image || '/zarda_logo.png'" @error="(e) => e.target.src = '/zarda_logo.png'" class="w-full h-48 object-cover bg-slate-800">
              <div v-if="pkg.isFeatured" class="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
                مميز
              </div>
              <div class="absolute top-4 left-4">
                <span :class="pkg.active ? 'bg-green-500' : 'bg-red-500'" class="px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                  <div :class="pkg.active ? 'bg-green-400' : 'bg-red-400'" class="w-2 h-2 rounded-full"></div>
                  {{ pkg.active ? 'مفعل' : 'غير مفعل' }}
                </span>
              </div>
            </div>

            <div class="p-6">
              <div class="mb-4">
                <h3 class="text-xl font-bold text-white mb-2 line-clamp-2">{{ pkg.title }}</h3>
                <div class="flex items-center gap-2 text-slate-300 mb-2">
                  <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span class="text-sm">{{ pkg.destination || 'غير محدد' }}</span>
                </div>
                <div class="flex items-center gap-2 text-slate-300">
                  <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                  <span class="text-sm">{{ pkg.category }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between mb-4">
                <div class="text-2xl font-bold text-green-400">
                  {{ pkg.price }} {{ pkg.currency || 'USD' }}
                </div>
                <div class="text-sm text-slate-400">
                  {{ pkg.views || 0 }} مشاهدة
                </div>
              </div>

              <div class="flex gap-3">
                <button @click="openEdit(pkg)" class="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  تعديل
                </button>
                <button @click="deletePackage(pkg.id)" class="bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 text-red-400 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  حذف
                </button>
              </div>

              <div class="mt-4 flex items-center justify-center">
                <label class="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" :checked="pkg.active" @change="toggleActive(pkg)" class="accent-green-500 w-5 h-5">
                  <span class="text-slate-300 group-hover:text-white transition-colors">تفعيل/إلغاء تفعيل</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Transition name="modal">
        <Modal :show="isEditOpen" @close="isEditOpen = false">
          <template #icon>
            <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </template>
          <template #title>تعديل العرض</template>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="col-span-2">
                  <label class="block text-slate-200 text-sm font-semibold mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    العنوان
                  </label>
                  <input v-model="editForm.title" type="text" class="w-full bg-white/10 border border-white/20 text-white rounded-xl p-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 placeholder-slate-400" placeholder="أدخل عنوان العرض">
                </div>
                <div>
                  <label class="block text-slate-200 text-sm font-semibold mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                    السعر
                  </label>
                  <input v-model="editForm.price" type="number" class="w-full bg-white/10 border border-white/20 text-white rounded-xl p-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 placeholder-slate-400" placeholder="0.00">
                </div>
                <div>
                  <label class="block text-slate-200 text-sm font-semibold mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                    العملة
                  </label>
                  <select v-model="editForm.currency" class="w-full bg-white/10 border border-white/20 text-white rounded-xl p-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200">
                    <option value="USD" class="bg-slate-800">دولار أمريكي</option>
                    <option value="LYD" class="bg-slate-800">دينار ليبي</option>
                  </select>
                </div>
                <div>
                  <label class="block text-slate-200 text-sm font-semibold mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                    النوع
                  </label>
                  <select v-model="editForm.category" class="w-full bg-white/10 border border-white/20 text-white rounded-xl p-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200">
                    <option value="سياحة" class="bg-slate-800">سياحة</option>
                    <option value="تأشيرات" class="bg-slate-800">تأشيرة</option>
                    <option value="طيران" class="bg-slate-800">طيران</option>
                  </select>
                </div>
                <div>
                  <label class="block text-slate-200 text-sm font-semibold mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    الوجهة
                  </label>
                  <input v-model="editForm.destination" type="text" class="w-full bg-white/10 border border-white/20 text-white rounded-xl p-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 placeholder-slate-400" placeholder="مثال: تركيا، مصر، الإمارات">
                </div>
                <div class="md:col-span-3">
                  <label class="block text-slate-200 text-sm font-semibold mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    التفاصيل
                  </label>
                  <textarea v-model="editForm.description" rows="4" class="w-full bg-white/10 border border-white/20 text-white rounded-xl p-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-200 placeholder-slate-400 resize-none" placeholder="اكتب تفاصيل العرض هنا..."></textarea>
                </div>
                <div class="md:col-span-3">
                  <label class="block text-slate-200 text-sm font-semibold mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    الصور
                  </label>
                  <div class="bg-white/5 border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-blue-400/50 transition-colors cursor-pointer" @click="$refs.editImageInput.click()">
                    <svg class="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="text-slate-300 mb-2">اضغط لاختيار صور جديدة</p>
                    <p class="text-slate-400 text-sm">سيتم الاحتفاظ بالصور الحالية إن لم ترفع صوراً جديدة</p>
                    <input ref="editImageInput" type="file" multiple @change="handleFileSelect" class="hidden" accept="image/*">
                  </div>
                  <div v-if="imageUrls.length" class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div v-for="(u,i) in imageUrls" :key="i" class="relative group">
                      <img :src="u" @error="(e) => e.target.src = '/zarda_logo.png'" class="w-full h-24 object-cover rounded-xl border-2 transition-all duration-200" :class="primaryEditIndex === i ? 'border-blue-400 ring-2 ring-blue-400/30' : 'border-white/20 group-hover:border-white/40'">
                      <button @click="removeImage(i)" class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 w-6 h-6 rounded-full text-white text-xs font-bold transition-colors opacity-0 group-hover:opacity-100">×</button>
                      <div v-if="primaryEditIndex === i" class="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-lg font-semibold">
                        الصورة الأساسية
                      </div>
                      <button v-else @click="primaryEditIndex = i; editForm.image = u" class="absolute bottom-2 left-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        اجعلها أساسية
                      </button>
                    </div>
                  </div>
                </div>
                <div class="md:col-span-3 flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input v-model="editForm.isFeatured" type="checkbox" class="accent-yellow-500 w-5 h-5">
                    <div class="flex items-center gap-2">
                      <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                      </svg>
                      <span class="text-slate-200 font-semibold">عرض مميز</span>
                    </div>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input v-model="editForm.active" type="checkbox" class="accent-green-500 w-5 h-5">
                    <div class="flex items-center gap-2">
                      <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span class="text-slate-200 font-semibold">تفعيل العرض</span>
                    </div>
                  </label>
                </div>
              </div>

              <div class="mt-8 flex gap-4">
                <button @click="saveEdit" :disabled="loading" class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-3">
                  <svg v-if="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <div v-if="loading" class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  {{ loading ? 'جاري الحفظ...' : 'حفظ التعديلات' }}
                </button>
                <button @click="isEditOpen=false" class="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all duration-200">
                  إلغاء
                </button>
              </div>

          <div v-if="message" class="mt-6 text-center p-4 rounded-xl" :class="message.includes('✅') ? 'bg-green-500/10 border border-green-400/20 text-green-400' : 'bg-red-500/10 border border-red-400/20 text-red-400'">
            {{ message }}
          </div>
        </Modal>
      </Transition>
    </div>
  </div>
</div>
</template>
<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
