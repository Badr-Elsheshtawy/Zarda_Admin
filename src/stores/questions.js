import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'

export const useQuestionsStore = defineStore('questions', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const all = computed(() => items.value)

  const fetchAll = async () => {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('questions')
        .select('*')
        .order('order', { ascending: true }) // ترتيب حسب order

      if (err) throw err
      items.value = data
    } catch (e) {
      console.error(e)
      error.value = 'تعذر جلب الأسئلة'
    } finally {
      loading.value = false
    }
  }

  const add = async (qData) => {
    loading.value = true
    try {
      // تجهيز البيانات لتطابق أعمدة الجدول في Supabase
      const payload = {
        text: qData.text,
        category: qData.category,
        type: qData.type,
        // التصحيح هنا: نستخدم 'order' بدلاً من 'weight'
        order: qData.weight || qData.order || 0 
      }

      const { data, error: err } = await supabase
        .from('questions')
        .insert([payload])
        .select()

      if (err) throw err
      
      if(data && data.length > 0) {
        items.value.push(data[0])
      }
    } catch (e) {
      console.error('Add question error:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const remove = async (id) => {
    try {
      const { error: err } = await supabase.from('questions').delete().eq('id', id)
      if (err) throw err
      items.value = items.value.filter(q => q.id !== id)
    } catch (e) {
      console.error(e)
      throw e
    }
  }
  
  return { all, loading, error, fetchAll, add, remove }
})