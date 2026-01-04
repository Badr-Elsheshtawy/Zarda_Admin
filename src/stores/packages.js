import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'

export const useAdminPackagesStore = defineStore('adminPackages', () => {
  const items = ref([])
  const loading = ref(false)
  const all = computed(() => items.value)

  const fetchAll = async () => {
    loading.value = true
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) items.value = data
    loading.value = false
  }

  const add = async (pkg) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('packages')
        .insert([pkg])
        .select()
      if (error) throw error
      items.value.unshift(data[0])
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const remove = async (id) => {
    await supabase.from('packages').delete().eq('id', id)
    items.value = items.value.filter(p => p.id !== id)
  }

  const toggleActive = async (id, currentState) => {
    const newState = !currentState
    await supabase.from('packages').update({ active: newState }).eq('id', id)
    const item = items.value.find(p => p.id === id)
    if (item) item.active = newState
  }

  const update = async (id, pkg) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('packages')
        .update(pkg)
        .eq('id', id)
        .select()
      if (error) throw error
      const index = items.value.findIndex(p => p.id === id)
      if (index !== -1) items.value[index] = data[0]
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return { items, all, loading, fetchAll, add, remove, toggleActive, update }
})