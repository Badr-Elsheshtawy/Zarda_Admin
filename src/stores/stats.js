import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, updateDoc, orderBy, query } from 'firebase/firestore'

export const useStatsStore = defineStore('stats', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetched = ref(0)

  const all = computed(() => items.value)
  const visitors = computed(() => items.value.length > 0 ? items.value[0].visitors : 0)

  const shouldRefetch = (maxAgeMs = 5 * 60 * 1000) => { // 5 minutes for stats
    if (!items.value.length) return true
    return Date.now() - lastFetched.value > maxAgeMs
  }

  const fetchAll = async ({ force = false } = {}) => {
    if (!force && !shouldRefetch()) return
    loading.value = true
    error.value = null
    try {
      const snap = await getDocs(collection(db, 'stats'))
      items.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      lastFetched.value = Date.now()
    } catch (e) {
      console.error('stats fetchAll failed:', e)
      error.value = 'تعذر جلب الإحصائيات'
    } finally {
      loading.value = false
    }
  }

  const updateVisitors = async (newVisitors) => {
    loading.value = true
    try {
      // Assuming there's only one document in stats
      if (items.value.length > 0) {
        const docRef = doc(db, 'stats', items.value[0].id)
        await updateDoc(docRef, {
          visitors: newVisitors,
          updatedAt: serverTimestamp()
        })
        items.value[0].visitors = newVisitors
      } else {
        // Create new stats document
        const docRef = await addDoc(collection(db, 'stats'), {
          visitors: newVisitors,
          updatedAt: serverTimestamp()
        })
        items.value.push({ id: docRef.id, visitors: newVisitors })
      }
    } catch (e) {
      console.error('stats updateVisitors failed:', e)
      error.value = 'تعذر تحديث الزوار'
    } finally {
      loading.value = false
    }
  }

  return {
    all,
    visitors,
    loading,
    error,
    fetchAll,
    updateVisitors
  }
})