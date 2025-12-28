import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, updateDoc, orderBy, query, where } from 'firebase/firestore'

export const useResponsesStore = defineStore('responses', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetched = ref(0)

  const all = computed(() => items.value)
  const byId = (id) => items.value.find(r => r.id === id)
  const byAgency = (agencyId) => items.value.filter(r => r.agencyId === agencyId)

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
        const qy = query(collection(db, 'responses'), orderBy('createdAt', 'desc'))
        snap = await getDocs(qy)
      } catch (e) {
        snap = await getDocs(collection(db, 'responses'))
      }
      items.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      lastFetched.value = Date.now()
    } catch (e) {
      console.error('responses fetchAll failed:', e)
      error.value = 'تعذر جلب الردود'
    } finally {
      loading.value = false
    }
  }

  const fetchByAgency = async (agencyId, { force = false } = {}) => {
    loading.value = true
    error.value = null
    try {
      const q = query(collection(db, 'responses'), where('agencyId', '==', agencyId), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      const responses = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      // Update items with new data
      responses.forEach(response => {
        const existingIndex = items.value.findIndex(r => r.id === response.id)
        if (existingIndex !== -1) {
          items.value[existingIndex] = response
        } else {
          items.value.push(response)
        }
      })
    } catch (e) {
      console.error('responses fetchByAgency failed:', e)
      error.value = 'تعذر جلب ردود الوكالة'
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
      const docRef = await addDoc(collection(db, 'responses'), payload)
      items.value.unshift({ id: docRef.id, ...payload })
    } catch (e) {
      console.error('add response failed:', e)
      error.value = 'تعذر إضافة الرد'
      throw e
    } finally {
      loading.value = false
    }
  }

  const update = async (id, data) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'responses', id), data)
      const index = items.value.findIndex(r => r.id === id)
      if (index !== -1) {
        items.value[index] = { ...items.value[index], ...data }
      }
    } catch (e) {
      console.error('update response failed:', e)
      error.value = 'تعذر تحديث الرد'
      throw e
    } finally {
      loading.value = false
    }
  }

  const remove = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'responses', id))
      items.value = items.value.filter(r => r.id !== id)
    } catch (e) {
      console.error('remove response failed:', e)
      error.value = 'تعذر حذف الرد'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    all,
    byId,
    byAgency,
    loading,
    error,
    fetchAll,
    fetchByAgency,
    add,
    update,
    remove
  }
})