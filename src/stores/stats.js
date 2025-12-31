import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'

export const useStatsStore = defineStore('stats', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const visitors = computed(() => {
    const siteStats = items.value.find(s => s.id === 'site')
    return siteStats ? siteStats.visitors : 0
  })

  const fetchAll = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('stats')
        .select('*')

      if (err) throw err
      items.value = data
    } catch (e) {
      console.error('stats fetchAll failed:', e)
      error.value = 'تعذر جلب الإحصائيات'
    } finally {
      loading.value = false
    }
  }

  return {
    visitors,
    loading,
    error,
    fetchAll
  }
})