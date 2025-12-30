<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase' // تأكد من المسار
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false) // إضافة حالة التحميل
const router = useRouter()

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // 1. استخدام دالة Supabase بدلاً من Firebase
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (authError) throw authError

    // 2. التحقق من وجود المستخدم وتوجيهه
    if (data.user) {
      router.push('/') 
    }
  } catch (err) {
    console.error(err)
    error.value = 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex justify-center items-center p-4">
    <div class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
      <div class="text-center mb-8">
        <img src="/zarda_logo.png" alt="Zarda" class="mx-auto h-16 w-auto mb-3" @error="(e) => e.target.src = '/zarda_logo.png'">
        <h1 class="text-3xl font-bold text-white">Zarda Admin</h1>
        <p class="text-slate-300 mt-2">لوحة التحكم</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-slate-300 mb-2">البريد الإلكتروني</label>
          <input v-model="email" type="email" class="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none placeholder-slate-400" placeholder="admin@zarda.com" required>
        </div>
        <div>
          <label class="block text-slate-300 mb-2">كلمة المرور</label>
          <input v-model="password" type="password" class="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none placeholder-slate-400" placeholder="••••••••" required>
        </div>
        
        <div v-if="error" class="text-red-400 text-center text-sm font-bold bg-red-500/10 border border-red-400/20 rounded-lg p-3 animate-pulse">{{ error }}</div>
        
        <button type="submit" :disabled="loading" class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 flex justify-center gap-2">
          <span v-if="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
          <span>{{ loading ? 'جاري الدخول...' : 'تسجيل الدخول' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>