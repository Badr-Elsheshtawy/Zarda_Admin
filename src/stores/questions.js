import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, updateDoc, orderBy, query, where } from 'firebase/firestore'

export const useQuestionsStore = defineStore('questions', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetched = ref(0)

  const all = computed(() => items.value)
  const byId = (id) => items.value.find(q => q.id === id)
  const byCategory = (category) => items.value.filter(q => q.category === category)

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
        const qy = query(collection(db, 'questions'), orderBy('createdAt', 'desc'))
        snap = await getDocs(qy)
      } catch (e) {
        snap = await getDocs(collection(db, 'questions'))
      }
      items.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      lastFetched.value = Date.now()
    } catch (e) {
      console.error('questions fetchAll failed:', e)
      error.value = 'تعذر جلب الأسئلة'
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
      const docRef = await addDoc(collection(db, 'questions'), payload)
      items.value.unshift({ id: docRef.id, ...payload })
    } catch (e) {
      console.error('add question failed:', e)
      error.value = 'تعذر إضافة السؤال'
      throw e
    } finally {
      loading.value = false
    }
  }

  const update = async (id, data) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'questions', id), data)
      const index = items.value.findIndex(q => q.id === id)
      if (index !== -1) {
        items.value[index] = { ...items.value[index], ...data }
      }
    } catch (e) {
      console.error('update question failed:', e)
      error.value = 'تعذر تحديث السؤال'
      throw e
    } finally {
      loading.value = false
    }
  }

  const remove = async (id) => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'questions', id))
      items.value = items.value.filter(q => q.id !== id)
    } catch (e) {
      console.error('remove question failed:', e)
      error.value = 'تعذر حذف السؤال'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    all,
    byId,
    byCategory,
    loading,
    error,
    fetchAll,
    add,
    update,
    remove
  }
})