import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'

export const useResponsesStore = defineStore('responses', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const all = computed(() => items.value)

  const fetchAll = async () => {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('responses')
        .select(`
          *,
          agencies!inner(name, logo_url)
        `) 
        .order('created_at', { ascending: false })

      if (err) throw err
      
      items.value = data.map(r => ({
        ...r,
        agencyName: r.agencies?.name || 'غير معروف',
        agencyLogo: r.agencies?.logo_url || '',
        finalNps: r.final_nps,
        createdAt: r.created_at
      }))
    } catch (e) {
      console.error(e)
      error.value = 'تعذر جلب الردود'
    } finally {
      loading.value = false
    }
  }

  return { all, loading, error, fetchAll }
})