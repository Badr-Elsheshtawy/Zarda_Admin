<script setup>
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/') // تحويل للداشبورد بعد النجاح
  } catch (err) {
    error.value = 'بيانات الدخول غير صحيحة!'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex justify-center items-center p-4">
    <div class="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
      <div class="text-center mb-8">
        <img src="/zarda_logo.png" alt="Zarda" class="mx-auto h-16 w-auto mb-3" @error="(e) => e.target.src = '/zarda_logo.png'">
        <h1 class="text-3xl font-bold text-blue-500">Zarda Admin</h1>
        <p class="text-gray-400 mt-2">لوحة التحكم</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-gray-400 mb-2">البريد الإلكتروني</label>
          <input v-model="email" type="email" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" required>
        </div>
        <div>
          <label class="block text-gray-400 mb-2">كلمة المرور</label>
          <input v-model="password" type="password" class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none" required>
        </div>
        
        <div v-if="error" class="text-red-400 text-center text-sm font-bold">{{ error }}</div>
        
        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">تسجيل الدخول</button>
      </form>
    </div>
  </div>
</template>