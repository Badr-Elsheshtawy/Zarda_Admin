<script setup>
import { ref, onMounted, computed } from 'vue'
import { db, auth, storage } from '../firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { useAdminPackagesStore } from '@/stores/packages'

const CLOUD_NAME = 'dqk4pzwvr' 
const UPLOAD_PRESET = 'zarda_uploads'

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
const loading = ref(false)
const message = ref('')
const store = useAdminPackagesStore()

const isEditOpen = ref(false)
const editingId = ref(null)
const editForm = ref({
  title: '', price: '', currency: 'USD', category: 'سياحة', destination: '', description: '', isFeatured: false, active: true, image: ''
})

const isAddOpen = ref(false)

const searchQuery = ref('')
const filterCategory = ref('')
const filterFeatured = ref(false)
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
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
  } catch (err) {
    loginError.value = 'بيانات الدخول غير صحيحة!'
    console.error(err)
  }
}

const handleLogout = async () => {
  await signOut(auth)
}

onMounted(() => {
  isLoggedIn.value = !!auth.currentUser
  checkingAuth.value = false
  if (isLoggedIn.value) fetchPackages()

  onAuthStateChanged(auth, (user) => {
    isLoggedIn.value = !!user
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
}

const removeImage = (index) => {
  imageFiles.value.splice(index, 1)
  imageUrls.value.splice(index, 1)
}

const uploadImagesToCloudinary = async () => {
  const uploadedUrls = []
  for (const file of imageFiles.value) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.secure_url) uploadedUrls.push(data.secure_url)
    } catch (error) { console.error('Upload Error:', error); throw error }
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
      image: finalImageLinks[0] || '',
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
      image: finalImageLinks[0] || editForm.value.image || ''
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

const closeAdd = () => {
  isAddOpen.value = false
  imageFiles.value = []
  imageUrls.value = []
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white font-sans" dir="rtl">
    
    <div v-if="checkingAuth" class="flex justify-center items-center h-screen">
      <div class="animate-spin text-4xl">⏳</div>
    </div>

    <div v-else-if="!isLoggedIn" class="flex justify-center items-center h-screen p-4">
      <div class="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <h1 class="text-3xl font-bold text-center mb-8 text-blue-500">دخول الأدمن 🔐</h1>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-gray-400 mb-2">البريد الإلكتروني</label>
            <input v-model="loginEmail" type="email" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:border-blue-500 outline-none" required>
          </div>
          <div>
            <label class="block text-gray-400 mb-2">كلمة المرور</label>
            <input v-model="loginPassword" type="password" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:border-blue-500 outline-none" required>
          </div>
          
          <div v-if="loginError" class="text-red-400 text-center text-sm font-bold">{{ loginError }}</div>
          
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">تسجيل الدخول</button>
        </form>
      </div>
    </div>

    <div v-else class="p-8 max-w-4xl mx-auto">
      <header class="space-y-4 mb-10 border-b border-gray-700 pb-4">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-blue-500">لوحة التحكم ⚙️</h1>
          <button @click="openAdd" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition">➕ إضافة عرض جديد</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="md:col-span-2">
            <input v-model="searchQuery" type="text" placeholder="بحث بالعنوان/الوجهة/التفاصيل..." class="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg p-3 outline-none" />
          </div>
          <div>
            <select v-model="filterCategory" class="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg p-3 outline-none">
              <option value="">الكل</option>
              <option value="سياحة">سياحة</option>
              <option value="تأشيرات">تأشيرة</option>
              <option value="طيران">طيران</option>
            </select>
          </div>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 text-gray-300"><input v-model="filterFeatured" type="checkbox" class="accent-blue-500"> مميز فقط</label>
          </div>
          <div>
            <select v-model="sortBy" class="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg p-3 outline-none">
              <option value="newest">الأحدث أولاً</option>
              <option value="price-asc">السعر: تصاعدي</option>
              <option value="price-desc">السعر: تنازلي</option>
              <option value="title-asc">العنوان: أ-ي</option>
              <option value="title-desc">العنوان: ي-أ</option>
            </select>
          </div>
        </div>
      </header>

      <Transition name="modal">
        <div v-if="isAddOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div class="p-[1px] rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30">
            <div class="bg-gray-800 w-full max-w-4xl p-6 rounded-2xl border border-gray-700 shadow-2xl">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-blue-400">إضافة عرض جديد</h3>
                <button @click="closeAdd" class="text-gray-400 hover:text-white">✕</button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="col-span-2">
                  <label class="block text-gray-400 mb-2">العنوان</label>
                  <input v-model="form.title" type="text" class="w-full bg-gray-700 border border-gray-600 focus:border-blue-500 rounded-lg p-3 outline-none">
                </div>
                <div>
                  <label class="block text-gray-400 mb-2">السعر</label>
                  <input v-model="form.price" type="number" class="w-full bg-gray-700 border border-gray-600 focus:border-blue-500 rounded-lg p-3 outline-none">
                </div>
                <div>
                  <label class="block text-gray-400 mb-2">العملة</label>
                  <select v-model="form.currency" class="w-full bg-gray-700 border border-gray-600 focus:border-blue-500 rounded-lg p-3 outline-none"><option value="USD">دولار</option><option value="LYD">دينار</option></select>
                </div>
                <div>
                  <label class="block text-gray-400 mb-2">النوع</label>
                  <select v-model="form.category" class="w-full bg-gray-700 border border-gray-600 focus:border-blue-500 rounded-lg p-3 outline-none"><option value="سياحة">سياحة</option><option value="تأشيرات">تأشيرة</option><option value="طيران">طيران</option></select>
                </div>
                <div>
                  <label class="block text-gray-400 mb-2">الوجهة</label>
                  <input v-model="form.destination" type="text" class="w-full bg-gray-700 border border-gray-600 focus:border-blue-500 rounded-lg p-3 outline-none">
                </div>
                <div class="md:col-span-2">
                  <label class="block text-gray-400 mb-2">التفاصيل</label>
                  <textarea v-model="form.description" rows="4" class="w-full bg-gray-700 border border-gray-600 focus:border-blue-500 rounded-lg p-3 outline-none"></textarea>
                </div>
                <div class="md:col-span-3 bg-gray-700/50 p-4 rounded-xl text-center border border-dashed border-gray-500">
                  <label class="cursor-pointer block text-blue-400 font-bold hover:underline">اضغط لاختيار الصور 📸<input type="file" multiple @change="handleFileSelect" class="hidden" accept="image/*"></label>
                  <div v-if="imageUrls.length" class="mt-4 grid grid-cols-4 gap-4">
                    <div v-for="(u,i) in imageUrls" :key="i" class="relative">
                      <img :src="u || '/zarda_logo.png'" @error="(e) => e.target.src = '/zarda_logo.png'" class="w-full h-20 object-cover rounded">
                      <button @click="removeImage(i)" class="absolute -top-2 -right-2 bg-red-500 w-5 h-5 rounded-full text-xs">✕</button>
                    </div>
                  </div>
                </div>
                <div class="md:col-span-3 flex items-center justify-between">
                  <label class="flex gap-2"><input v-model="form.isFeatured" type="checkbox" class="accent-blue-500"> عرض مميز</label>
                  <label class="flex gap-2"><input v-model="form.active" type="checkbox" class="accent-green-500"> تفعيل العرض</label>
                </div>
              </div>
              <div class="mt-6 flex gap-3">
                <button @click="addPackage" :disabled="loading" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold">{{ loading ? 'جاري الرفع...' : 'نشر العرض' }}</button>
                <button @click="closeAdd" class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">إلغاء</button>
              </div>
              <div v-if="message" class="mt-4 text-center text-green-400">{{ message }}</div>
            </div>
          </div>
        </div>
      </Transition>

      <div class="space-y-4 pb-20">
        <div v-if="displayedPackages.length === 0" class="text-center text-gray-400 py-10 border border-dashed border-gray-700 rounded-lg">
          لا توجد عروض منشورة بعد.
        </div>

        <div v-else v-for="pkg in displayedPackages" :key="pkg.id" class="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700">
          <div class="flex items-center gap-4">
            <img :src="pkg.image || '/zarda_logo.png'" @error="(e) => e.target.src = '/zarda_logo.png'" class="w-16 h-16 rounded object-cover bg-gray-900">
            <div>
              <h3 class="font-bold">{{ pkg.title }}</h3>
              <p class="text-xs text-gray-400">{{ pkg.destination }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-sm text-gray-300">
              {{ pkg.price }} {{ pkg.currency || 'USD' }}
            </div>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" :checked="pkg.active" @change="toggleActive(pkg)" class="accent-green-500">
              <span class="text-gray-300">{{ pkg.active ? 'مفعل' : 'غير مفعل' }}</span>
            </label>
            <button @click="openEdit(pkg)" class="text-blue-400 bg-blue-900/20 px-3 py-1 rounded hover:bg-blue-900/40">تعديل</button>
            <button @click="deletePackage(pkg.id)" class="text-red-400 bg-red-900/20 px-3 py-1 rounded hover:bg-red-900/40">حذف</button>
          </div>
        </div>
      </div>

      <Transition name="modal">
        <div v-if="isEditOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
          <div class="p-[1px] rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30">
            <div class="bg-gray-800 w-full max-w-4xl p-6 rounded-2xl border border-gray-700 shadow-2xl">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-blue-400">تعديل العرض</h3>
            <button @click="isEditOpen=false" class="text-gray-400 hover:text-white">✕</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="col-span-2"><label class="block text-gray-400 mb-2">العنوان</label><input v-model="editForm.title" type="text" class="w-full bg-gray-700 rounded-lg p-3 outline-none"></div>
            <div><label class="block text-gray-400 mb-2">السعر</label><input v-model="editForm.price" type="number" class="w-full bg-gray-700 rounded-lg p-3 outline-none"></div>
            <div>
              <label class="block text-gray-400 mb-2">العملة</label>
              <select v-model="editForm.currency" class="w-full bg-gray-700 rounded-lg p-3 outline-none"><option value="USD">دولار</option><option value="LYD">دينار</option></select>
            </div>
            <div>
              <label class="block text-gray-400 mb-2">النوع</label>
              <select v-model="editForm.category" class="w-full bg-gray-700 rounded-lg p-3 outline-none"><option value="سياحة">سياحة</option><option value="تأشيرات">تأشيرة</option><option value="طيران">طيران</option></select>
            </div>
            <div><label class="block text-gray-400 mb-2">الوجهة</label><input v-model="editForm.destination" type="text" class="w-full bg-gray-700 rounded-lg p-3 outline-none"></div>
            <div class="md:col-span-2"><label class="block text-gray-400 mb-2">التفاصيل</label><textarea v-model="editForm.description" rows="4" class="w-full bg-gray-700 rounded-lg p-3 outline-none"></textarea></div>

            <div class="md:col-span-3 bg-gray-700/50 p-4 rounded-xl text-center border border-dashed border-gray-500">
              <label class="cursor-pointer block text-blue-400 font-bold hover:underline">اضغط لاختيار صور جديدة 📸<input type="file" multiple @change="handleFileSelect" class="hidden" accept="image/*"></label>
              <div v-if="imageUrls.length" class="mt-4 grid grid-cols-4 gap-4">
                <div v-for="(u,i) in imageUrls" :key="i" class="relative">
                  <img :src="u" @error="(e) => e.target.src = '/zarda_logo.png'" class="w-full h-20 object-cover rounded">
                  <button @click="removeImage(i)" class="absolute -top-2 -right-2 bg-red-500 w-5 h-5 rounded-full text-xs">✕</button>
                </div>
              </div>
              <div v-else class="mt-2 text-sm text-gray-400">سيتم الاحتفاظ بالصور الحالية إن لم ترفع صوراً جديدة.</div>
            </div>

            <div class="md:col-span-3 flex items-center justify-between">
              <label class="flex gap-2"><input v-model="editForm.isFeatured" type="checkbox" class="accent-blue-500"> عرض مميز</label>
              <label class="flex gap-2"><input v-model="editForm.active" type="checkbox" class="accent-green-500"> تفعيل العرض</label>
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <button @click="saveEdit" :disabled="loading" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold">حفظ</button>
            <button @click="isEditOpen=false" class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">إلغاء</button>
          </div>
          <div v-if="message" class="mt-4 text-center text-green-400">{{ message }}</div>
            </div>
          </div>
        </div>
      </Transition>
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
</style>