import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, updateDoc, orderBy, query } from 'firebase/firestore'

export const useAdminPackagesStore = defineStore('adminPackages', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetched = ref(0)

  const all = computed(() => items.value)
  const byId = (id) => items.value.find(p => p.id === id)

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
        const qy = query(collection(db, 'packages'), orderBy('createdAt', 'desc'))
        snap = await getDocs(qy)
      } catch (e) {
        snap = await getDocs(collection(db, 'packages'))
      }
      items.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      lastFetched.value = Date.now()
    } catch (e) {
      console.error('admin fetchAll failed:', e)
      error.value = 'تعذر جلب العروض'
    } finally {
      loading.value = false
    }
  }

  const add = async (data) => {
    loading.value = true
    try {
      const payload = {
        ...data,
        price: Number(data.price),
        createdAt: serverTimestamp(),
        views: data.views ?? 0,
      }
      const refDoc = await addDoc(collection(db, 'packages'), payload)
      // optimistic insert (without resolved serverTimestamp)
      items.value.unshift({ id: refDoc.id, ...data })
      return refDoc.id
    } catch (e) {
      console.error('admin add failed:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const update = async (id, updates) => {
    loading.value = true
    try {
      const payload = { ...updates, price: Number(updates.price) }
      await updateDoc(doc(db, 'packages', id), payload)
      const idx = items.value.findIndex(p => p.id === id)
      if (idx !== -1) items.value[idx] = { ...items.value[idx], ...updates }
    } catch (e) {
      console.error('admin update failed:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const remove = async (id) => {
    await deleteDoc(doc(db, 'packages', id))
    items.value = items.value.filter(p => p.id !== id)
  }

  const toggleActive = async (id, currentActive) => {
    const next = !currentActive
    await updateDoc(doc(db, 'packages', id), { active: next })
    const idx = items.value.findIndex(p => p.id === id)
    if (idx !== -1) items.value[idx].active = next
    return next
  }

  return { items, loading, error, lastFetched, all, byId, fetchAll, add, update, remove, toggleActive }
})
