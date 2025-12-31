import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'

export const useAgenciesStore = defineStore('agencies', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const all = computed(() => items.value)
  const byId = (id) => items.value.find(a => a.id === id)

  const mapData = (data) => ({
    id: data.id,
    name: data.name,
    slug: data.slug,
    targetEmployees: data.target_employees,
    logoUrl: data.logo_url,
    createdAt: data.created_at
  })

  const getFilePathFromUrl = (url) => {
    if (!url) return null
    const parts = url.split('/logos/')
    return parts.length > 1 ? parts[1] : null
  }

  const fetchAll = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('agencies')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      items.value = data.map(mapData)
    } catch (e) {
      console.error('fetchAll error:', e)
      error.value = 'تعذر جلب الوكالات'
    } finally {
      loading.value = false
    }
  }

  const add = async (agencyData) => {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('agencies')
        .insert([{
            name: agencyData.name,
            slug: agencyData.slug,
            target_employees: agencyData.targetEmployees,
            logo_url: agencyData.logoUrl
          }])
        .select()

      if (err) throw err
      if (data?.length) items.value.unshift(mapData(data[0]))
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const update = async (id, updates) => {
    loading.value = true
    try {
      const currentAgency = items.value.find(a => a.id === id)
      const oldLogoUrl = currentAgency?.logoUrl

      if (updates.logoUrl && oldLogoUrl && updates.logoUrl !== oldLogoUrl) {
        const oldPath = getFilePathFromUrl(oldLogoUrl)
        
        if (oldPath) {
          const { error: deleteErr } = await supabase.storage
            .from('logos')
            .remove([oldPath])
            
          if (deleteErr) console.warn('فشل حذف الصورة القديمة (غير مؤثر):', deleteErr)
          else console.log('تم حذف الصورة القديمة بنجاح:', oldPath)
        }
      }

      const dbUpdates = {}
      if (updates.name) dbUpdates.name = updates.name
      if (updates.targetEmployees) dbUpdates.target_employees = updates.targetEmployees
      if (updates.logoUrl) dbUpdates.logo_url = updates.logoUrl
      if (updates.slug) dbUpdates.slug = updates.slug

      const { data, error: err } = await supabase
        .from('agencies')
        .update(dbUpdates)
        .eq('id', id)
        .select()

      if (err) throw err

      const index = items.value.findIndex(a => a.id === id)
      if (index !== -1 && data.length) {
        items.value[index] = { ...items.value[index], ...mapData(data[0]) }
      }
    } catch (e) {
      console.error('update error:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const remove = async (id, logoUrl) => {
    loading.value = true
    try {
      const { error: responsesError } = await supabase
        .from('responses')
        .delete()
        .or(`agency_id.eq.${id},agencyId.eq.${id}`)
      
      if (responsesError) {
        console.warn('فشل حذف الاستجابات المرتبطة:', responsesError)
      }

      const path = getFilePathFromUrl(logoUrl)
      if (path) {
        const { error: storageError } = await supabase.storage.from('logos').remove([path])
        if (storageError) {
          console.warn('فشل حذف الصورة من التخزين:', storageError)
        }
      }

      const { error: err } = await supabase.from('agencies').delete().eq('id', id)
      if (err) throw err

      items.value = items.value.filter(a => a.id !== id)
    } catch (e) {
      console.error('خطأ في حذف الوكالة:', e)
      throw e
    } finally {
      loading.value = false
    }
  }
  
  const fetchBySlug = async (slug) => {
    loading.value = true;
    const current = ref(null);
    try {
        const { data, error: err } = await supabase
            .from('agencies')
            .select('*')
            .eq('slug', slug)
            .single();

        if (err) throw err;
        current.value = mapData(data);
    } catch (e) {
        error.value = 'الرابط غير صحيح';
    } finally {
        loading.value = false;
    }
    return { current, error };
  };

  return { all, byId, loading, error, fetchAll, add, update, remove, fetchBySlug }
})