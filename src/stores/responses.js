import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

export const useResponsesStore = defineStore('responses', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetched = ref(0)

  const all = computed(() => items.value)

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
        const qy = query(collection(db, 'responses'), orderBy('timestamp', 'desc'))
        snap = await getDocs(qy)
      } catch (e) {
        snap = await getDocs(collection(db, 'responses'))
      }
      items.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      lastFetched.value = Date.now()
    } catch (e) {
      console.error('fetch responses failed:', e)
      error.value = 'تعذر جلب الردود'
    } finally {
      loading.value = false
    }
  }

  const getAnalytics = computed(() => {
    const categories = ['Flight', 'Hotel', 'Visa', 'Finance']
    const analytics = {}

    categories.forEach((category) => {
      const categoryResponses = items.value.filter((r) =>
        r.answers.some((a) => a.category === category),
      )
      const ratings = categoryResponses.flatMap((r) =>
        r.answers.filter((a) => a.category === category && a.rating).map((a) => a.rating),
      )
      const avgRating = ratings.length
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : 0
      analytics[category] = {
        count: categoryResponses.length,
        avgRating: parseFloat(avgRating),
      }
    })

    const npsScores = items.value
      .filter((r) => r.nps !== null && r.nps !== undefined)
      .map((r) => r.nps)
    const promoters = npsScores.filter((score) => score >= 9).length
    const passives = npsScores.filter((score) => score >= 7 && score <= 8).length
    const detractors = npsScores.filter((score) => score <= 6).length
    const totalNps = npsScores.length
    const npsScore = totalNps > 0 ? (((promoters - detractors) / totalNps) * 100).toFixed(1) : 0

    analytics.nps = {
      score: parseFloat(npsScore),
      promoters,
      passives,
      detractors,
      total: totalNps,
    }

    return analytics
  })

  return {
    items,
    loading,
    error,
    all,
    fetchAll,
    getAnalytics,
  }
})
