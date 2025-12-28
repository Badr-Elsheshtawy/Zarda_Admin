import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, updateDoc, orderBy, query } from 'firebase/firestore'

export const useAgenciesStore = defineStore('agencies', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetched = ref(0)

  const all = computed(() => items.value)
  const byId = (id) => items.value.find(a => a.id === id)

  const shouldRefetch = (maxAgeMs = 2 * 60 * 1000) => {
    if (!items.value.length) return true
    return Date.now() - lastFetched.value > maxAgeMs
  }

  const fetchAll = async ({ force = false } = {}) => {
    if (!force && !shouldRefetch()) return
    loading.value = true
    error.value = null
    try {
      let snap
      try {
        const qy = query(collection(db, 'agencies'), orderBy('createdAt', 'desc'))
        snap = await getDocs(qy)
      } catch (e) {
        snap = await getDocs(collection(db, 'agencies'))
      }
      items.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      lastFetched.value = Date.now()
    } catch (e) {
      console.error('agencies fetchAll failed:', e)
      error.value = 'تعذر جلب الوكالات'
    } finally {
      loading.value = false
    }
  }

  const add = async (data) => {
    loading.value = true
    try {
      const payload = {
        ...data,
        createdAt: serverTimestamp(),
      }
      const docRef = await addDoc(collection(db, 'agencies'), payload)
      items.value.unshift({ id: docRef.id, ...payload })
    } catch (e) {
      console.error('add agency failed:', e)
      error.value = 'تعذر إضافة الوكالة'
      throw e
    } finally {
      loading.value = false
    }
  }

  const update = async (id, data) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'agencies', id), data)
      const index = items.value.findIndex(a => a.id === id)
      if (index !== -1) {
        items.value[index] = { ...items.value[index], ...data }
      }
    } catch (e) {
      console.error('update agency failed:', e)
      error.value = 'تعذر تحديث الوكالة'
      throw e
    } finally {
      loading.value = false
    }
  }

  const remove = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'agencies', id))
      items.value = items.value.filter(a => a.id !== id)
    } catch (e) {
      console.error('remove agency failed:', e)
      error.value = 'تعذر حذف الوكالة'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    all,
    byId,
    loading,
    error,
    fetchAll,
    add,
    update,
    remove
  }
})