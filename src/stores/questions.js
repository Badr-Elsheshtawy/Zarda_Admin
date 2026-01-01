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
        .order('order', { ascending: true }) 

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
      const nextOrder = items.value.length > 0 ? Math.max(...items.value.map(q => q.order || 0)) + 1 : 1

      const payload = {
        text: qData.text,
        category: qData.category,
        type: qData.type,
        order: nextOrder
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

  const update = async (id, updates) => {
    loading.value = true
    try {
      const payload = {}
      if (updates.text !== undefined) payload.text = updates.text
      if (updates.category !== undefined) payload.category = updates.category
      if (updates.type !== undefined) payload.type = updates.type
      if (updates.order !== undefined || updates.weight !== undefined) {
        payload.order = updates.order || updates.weight || 0
      }

      const { data, error: err } = await supabase
        .from('questions')
        .update(payload)
        .eq('id', id)
        .select()

      if (err) throw err

      const index = items.value.findIndex(q => q.id === id)
      if (index !== -1 && data.length) {
        items.value[index] = { ...items.value[index], ...data[0] }
      }
    } catch (e) {
      console.error('Update question error:', e)
      throw e
    } finally {
      loading.value = false
    }
  }
  
  return { all, loading, error, fetchAll, add, remove, update }
})