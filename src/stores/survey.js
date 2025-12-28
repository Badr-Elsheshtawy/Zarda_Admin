import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/firebase' // تأكد من نسخ ملف firebase.js من مشروع الأدمن
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore'

export const useSurveyStore = defineStore('survey', () => {
  // State
  const agency = ref(null)
  const questions = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Survey State
  const step = ref(0) // 0:Welcome, 1:Department, 2:Questions, 3:NPS, 4:Finish
  const selectedDepartment = ref('')
  const employeeName = ref('')
  const answers = ref({}) // { questionId: { rating: 5, text: '' } }
  const npsScore = ref(null)

  // Actions
  const fetchAgencyBySlug = async (slug) => {
    loading.value = true
    error.value = null
    try {
      const q = query(collection(db, 'agencies'), where('slug', '==', slug))
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        error.value = 'رابط الاستبيان غير صحيح أو منتهي الصلاحية.'
        return false
      }
      
      agency.value = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
      return true
    } catch (e) {
      console.error(e)
      error.value = 'حدث خطأ في الاتصال.'
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchQuestions = async () => {
    loading.value = true
    try {
      // نجلب الأسئلة الخاصة بالقسم المختار + الأسئلة العامة (إن وجدت)
      const q = query(
        collection(db, 'questions'), 
        where('category', 'in', [selectedDepartment.value, 'General']),
        orderBy('order', 'asc')
      )
      const snapshot = await getDocs(q)
      questions.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const submitSurvey = async () => {
    loading.value = true
    try {
      // تجهيز مصفوفة الإجابات
      const formattedAnswers = questions.value.map(q => ({
        questionId: q.id,
        question: q.text,
        category: q.category,
        rating: answers.value[q.id]?.rating || null,
        text: answers.value[q.id]?.text || ''
      }))

      await addDoc(collection(db, 'responses'), {
        agencyId: agency.value.id,
        agencyName: agency.value.name,
        agencyLogo: agency.value.logoUrl,
        employeeName: employeeName.value,
        department: selectedDepartment.value,
        answers: formattedAnswers,
        finalNps: npsScore.value,
        timestamp: serverTimestamp()
      })
      
      step.value = 4 // الانتقال لصفحة الشكر
    } catch (e) {
      console.error(e)
      alert('حدث خطأ أثناء الإرسال، حاول مرة أخرى.')
    } finally {
      loading.value = false
    }
  }

  return { 
    agency, questions, loading, error, step, 
    selectedDepartment, employeeName, answers, npsScore,
    fetchAgencyBySlug, fetchQuestions, submitSurvey 
  }
})