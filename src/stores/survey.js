import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/supabase'

export const useSurveyStore = defineStore('survey', () => {
  const agency = ref(null)
  const questions = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  const step = ref(0)
  const selectedDepartment = ref('')
  const employeeName = ref('')
  const answers = ref({}) 
  const npsScore = ref(null)

  // 1. جلب الوكالة
  const fetchAgencyBySlug = async (slug) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('agencies')
        .select('*')
        .eq('slug', slug)
        .single() // نتوقع نتيجة واحدة

      if (err || !data) {
        error.value = 'رابط الاستبيان غير صحيح.'
        return false
      }
      
      // تخزين البيانات (مع مراعاة أسماء الأعمدة في Supabase)
      agency.value = { 
        id: data.id, 
        name: data.name, 
        logoUrl: data.logo_url, // تأكد من الاسم في الجدول
        targetEmployees: data.target_employees 
      }
      return true
    } catch (e) {
      console.error(e)
      error.value = 'حدث خطأ في الاتصال.'
      return false
    } finally {
      loading.value = false
    }
  }

  // 2. جلب الأسئلة
  const fetchQuestions = async () => {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('questions')
        .select('*')
        // الفلتر: القسم المختار OR عام
        .in('category', [selectedDepartment.value, 'General'])
        .order('order', { ascending: true })

      if (err) throw err
      questions.value = data
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  // 3. إرسال الاستبيان
  const submitSurvey = async () => {
    loading.value = true
    try {
      const formattedAnswers = questions.value.map(q => ({
        questionId: q.id,
        question: q.text,
        category: q.category,
        rating: answers.value[q.id]?.rating || null,
        text: answers.value[q.id]?.text || ''
      }))

      const { error: err } = await supabase
        .from('responses')
        .insert([
          {
            agency_id: agency.value.id,
            employee_name: employeeName.value,
            department: selectedDepartment.value,
            answers: formattedAnswers, // سيتم تخزينه كـ JSONB تلقائياً
            final_nps: npsScore.value
          }
        ])

      if (err) throw err
      
      step.value = 4 // النجاح
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
    fetchAgencyBySlug, fetchQuestions, submitSurvey,
    // Helper to add answer
    addAnswer: (qId, val) => {
       if(!answers.value[qId]) answers.value[qId] = {}
       Object.assign(answers.value[qId], val)
    }
  }
})