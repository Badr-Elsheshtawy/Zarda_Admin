import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/supabase'

export const useResponsesStore = defineStore('responses', () => {
  const all = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchAll = async ({ force = false } = {}) => {
    loading.value = true
    console.log("1. بدء عملية جلب البيانات...")
    try {
      const { data, error: err } = await supabase
        .from('responses')
        .select(`
          *,
          agencies:agency_id (name, logo_url)
        `)
        .order('created_at', { ascending: false })

      if (err) {
        console.error("❌ خطأ من Supabase:", err) 
        throw err
      }

      console.log("✅ البيانات الخام من القاعدة:", data) 

      if (!data || data.length === 0) {
        console.warn("⚠️ الطلب نجح لكن المصفوفة فارغة! تأكد من وجود بيانات في الجدول وتأكد من سياسات RLS")
      }

      all.value = data.map(r => {
        let parsedAnswers = []
        if (r.answers) {
            if (typeof r.answers === 'string') {
                try {
                    parsedAnswers = JSON.parse(r.answers)
                } catch (e) {
                    console.error("خطأ في تحليل JSON للرد رقم:", r.id, e)
                }
            } else {
                parsedAnswers = r.answers
            }
        }
        
        return {
          ...r,
          agencyName: r.agencies?.name || 'غير معروف',
          agencyLogo: r.agencies?.logo_url || '',
          answers: parsedAnswers
        }
      })
      
      console.log("✅ البيانات النهائية في المتجر:", all.value)

    } catch (e) {
      console.error('Error fetching responses:', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { all, loading, error, fetchAll }
})