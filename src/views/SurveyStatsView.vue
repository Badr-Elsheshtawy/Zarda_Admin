<template>
  <div class="space-y-8 animate-fade-in">
    <div
      class="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg"
    >
      <div>
        <h2 class="text-3xl font-bold text-white flex items-center gap-2">
          <span class="text-blue-500">📊</span> إحصائيات الاستبيانات
        </h2>
        <p class="text-gray-400 mt-1">تحليل أداء الشركة ورضا العملاء</p>
      </div>

      <div class="flex items-center gap-3">
        <select
          v-model="timeFilter"
          class="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 outline-none focus:border-blue-500"
        >
          <option value="all">📅 كل الوقت</option>
          <option value="month">📅 آخر 30 يوم</option>
          <option value="week">📅 آخر 7 أيام</option>
        </select>

        <button
          @click="exportToExcel"
          :disabled="isExporting"
          class="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-lg text-white font-bold transition flex items-center gap-2"
        >
          <span v-if="isExporting">⏳</span>
          <span v-else>📄</span>
          Excel
        </button>
        <button
          @click="exportToPDF"
          :disabled="isExporting"
          class="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded-lg text-white font-bold transition flex items-center gap-2"
        >
          <span v-if="isExporting">⏳</span>
          <span v-else>📕</span>
          PDF
        </button>
        <button
          @click="fetchStats"
          class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-gray-200 transition"
          title="تحديث البيانات"
        >
          🔄
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-32">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"
      ></div>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group"
        >
          <div
            class="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-bl-full group-hover:bg-blue-500/20 transition-all duration-500"
          ></div>
          <div class="relative z-10">
            <div class="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">
              إجمالي الردود
            </div>
            <div class="text-5xl font-bold text-white">{{ filteredResponses.length }}</div>
            <div class="mt-4 text-sm text-blue-400 font-medium">📝 تم استلامها</div>
          </div>
        </div>

        <div
          class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group"
        >
          <div
            class="absolute right-0 top-0 w-32 h-32 bg-green-500/10 rounded-bl-full group-hover:bg-green-500/20 transition-all duration-500"
          ></div>
          <div class="relative z-10">
            <div class="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">
              معدل NPS (الولاء)
            </div>
            <div class="flex items-baseline gap-2">
              <div class="text-5xl font-bold text-green-400">{{ avgNps }}</div>
              <span class="text-gray-500 font-bold">/ 10</span>
            </div>
            <div class="mt-4 text-sm text-green-500/80 font-medium">⭐ متوسط رضا العملاء</div>
          </div>
        </div>

        <div
          class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group"
        >
          <div
            class="absolute right-0 top-0 w-32 h-32 bg-yellow-500/10 rounded-bl-full group-hover:bg-yellow-500/20 transition-all duration-500"
          ></div>
          <div class="relative z-10">
            <div class="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">
              الوكالات المتفاعلة
            </div>
            <div class="text-5xl font-bold text-yellow-400">{{ activeAgenciesCount }}</div>
            <div class="mt-4 text-sm text-yellow-500/80 font-medium">🏢 وكالة شاركت في التقييم</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
          <h3 class="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <span>📈</span> الأداء حسب القسم
          </h3>
          <div class="h-80 w-full">
            <Bar :data="categoryRatingsChartData" :options="chartOptions" />
          </div>
        </div>

        <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
          <h3 class="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <span>💬</span> أحدث التعليقات
          </h3>
          <div class="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            <div v-if="textualFeedback.length === 0" class="text-center text-gray-500 py-10">
              لا توجد تعليقات نصية في هذه الفترة
            </div>
            <div
              v-for="feedback in textualFeedback"
              :key="feedback.id"
              class="bg-gray-700/50 p-4 rounded-xl border border-gray-600 hover:border-gray-500 transition"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span class="font-bold text-white text-sm">{{
                    feedback.employeeName || 'موظف'
                  }}</span>
                  <span class="text-gray-500 text-xs px-2 bg-gray-800 rounded-full">{{
                    feedback.agencyName
                  }}</span>
                </div>
                <span class="text-xs text-gray-400">{{ feedback.date }}</span>
              </div>
              <div
                v-for="item in feedback.feedback"
                :key="item.question"
                class="mt-2 pl-4 border-r-2 border-gray-600"
              >
                <p class="text-xs text-gray-400 mb-1">{{ item.question }}</p>
                <p class="text-sm text-gray-200">{{ item.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
        <div class="p-6 border-b border-gray-700">
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <span>📋</span> سجل التقديمات الأخير
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-white text-sm">
            <thead class="bg-gray-900/50 text-gray-400">
              <tr>
                <th class="text-right p-4">التاريخ</th>
                <th class="text-right p-4">الوكالة</th>
                <th class="text-right p-4">الموظف</th>
                <th class="text-right p-4">القسم</th>
                <th class="text-center p-4">NPS</th>
                <th class="text-center p-4">التفاصيل</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              <tr
                v-for="response in filteredResponses.slice(0, 15)"
                :key="response.id"
                class="hover:bg-gray-700/30 transition"
              >
                <td class="p-4 text-gray-400">
                  {{
                    new Date(
                      response.timestamp?.toDate?.() || response.timestamp,
                    ).toLocaleDateString('ar-EG')
                  }}
                </td>
                <td class="p-4 font-bold">
                  {{ agenciesStore.byId(response.agencyId)?.name || 'غير محدد' }}
                </td>
                <td class="p-4">{{ response.employeeName || '-' }}</td>
                <td class="p-4">
                  <span class="px-2 py-1 rounded bg-gray-700 text-xs">{{
                    response.department
                  }}</span>
                </td>
                <td class="p-4 text-center">
                  <span :class="['px-2 py-1 rounded font-bold', getNpsColor(response.finalNps)]">
                    {{ response.finalNps }}/10
                  </span>
                </td>
                <td class="p-4 text-center">
                  <button
                    @click="showDetails(response)"
                    class="text-blue-400 hover:text-white transition"
                  >
                    👁️ عرض
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      v-if="selectedResponse"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="selectedResponse = null"
    >
      <div
        class="bg-gray-800 rounded-2xl w-full max-w-2xl border border-gray-600 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div class="p-6 border-b border-gray-700 bg-gray-900/50 flex justify-between">
          <h2 class="text-xl font-bold text-white">تفاصيل الرد الكاملة</h2>
          <button @click="selectedResponse = null" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <div class="p-6 overflow-y-auto custom-scrollbar">
          <div class="grid grid-cols-2 gap-4 mb-6 bg-gray-700/30 p-4 rounded-xl">
            <div>
              <span class="text-gray-400 block text-xs">الوكالة</span>
              <span class="text-white font-bold">{{
                agenciesStore.byId(selectedResponse.agencyId)?.name
              }}</span>
            </div>
            <div>
              <span class="text-gray-400 block text-xs">الموظف</span>
              <span class="text-white font-bold">{{ selectedResponse.employeeName }}</span>
            </div>
            <div>
              <span class="text-gray-400 block text-xs">القسم</span>
              <span class="text-white font-bold">{{ selectedResponse.department }}</span>
            </div>
            <div>
              <span class="text-gray-400 block text-xs">تقييم NPS</span>
              <span class="text-green-400 font-bold text-lg"
                >{{ selectedResponse.finalNps }}/10</span
              >
            </div>
          </div>

          <h3 class="font-bold text-blue-400 mb-3 border-b border-gray-700 pb-2">
            الإجابات التفصيلية:
          </h3>
          <div class="space-y-3">
            <div
              v-for="answer in selectedResponse.answers"
              :key="answer.question"
              class="bg-gray-700/50 p-3 rounded-lg border border-gray-700"
            >
              <p class="text-sm font-medium text-gray-200 mb-2">{{ answer.question }}</p>
              <div class="flex items-center gap-2">
                <div v-if="answer.rating" class="flex text-yellow-400 text-sm">
                  <span v-for="i in 5" :key="i">{{ i <= answer.rating ? '★' : '☆' }}</span>
                  <span class="mr-2 text-gray-400">({{ answer.rating }}/5)</span>
                </div>
              </div>
              <div
                v-if="answer.text"
                class="mt-2 bg-gray-800 p-2 rounded text-sm text-gray-300 border-r-2 border-blue-500"
              >
                "{{ answer.text }}"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useResponsesStore } from '@/stores/responses'
import { useAgenciesStore } from '@/stores/agencies'
import { useQuestionsStore } from '@/stores/questions'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const responsesStore = useResponsesStore()
const agenciesStore = useAgenciesStore()
const questionsStore = useQuestionsStore()
const loading = ref(true)
const selectedResponse = ref(null)
const timeFilter = ref('all') 
const isExporting = ref(false)

const fetchStats = async () => {
  loading.value = true
  try {
    await Promise.all([
      responsesStore.fetchAll(),
      agenciesStore.fetchAll(),
      questionsStore.fetchAll(),
    ])
  } finally {
    loading.value = false
  }
}

onMounted(fetchStats)

const filteredResponses = computed(() => {
  const all = responsesStore.all
  if (timeFilter.value === 'all') return all

  const now = new Date()
  const days = timeFilter.value === 'month' ? 30 : 7
  const threshold = new Date(now.setDate(now.getDate() - days))

  return all.filter((r) => {
    const rDate = new Date(r.timestamp?.toDate?.() || r.timestamp)
    return rDate >= threshold
  })
})

const avgNps = computed(() => {
  const npsValues = filteredResponses.value.map((r) => r.finalNps).filter((n) => n)
  return npsValues.length ? (npsValues.reduce((a, b) => a + b, 0) / npsValues.length).toFixed(1) : 0
})

const activeAgenciesCount = computed(() => {
  const uniqueIds = new Set(filteredResponses.value.map((r) => r.agencyId))
  return uniqueIds.size
})

const categoryRatingsChartData = computed(() => {
  const categories = ['Flight', 'Hotel', 'Visa', 'Finance']
  const data = []

  categories.forEach((cat) => {
    const catResponses = filteredResponses.value.flatMap((r) =>
      r.answers.filter((a) => a.category === cat && a.rating).map((a) => a.rating),
    )
    const avg = catResponses.length
      ? catResponses.reduce((a, b) => a + b, 0) / catResponses.length
      : 0
    data.push(avg)
  })

  return {
    labels: ['التذاكر', 'الفنادق', 'التأشيرات', 'المالية'],
    datasets: [
      {
        label: 'متوسط التقييم (من 5)',
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        data: data,
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  }
})

const textualFeedback = computed(() => {
  return filteredResponses.value
    .filter((r) => r.answers.some((a) => a.text && a.text.trim()))
    .map((r) => ({
      id: r.id,
      agencyName: agenciesStore.byId(r.agencyId)?.name || 'غير محدد',
      employeeName: r.employeeName,
      date: new Date(r.timestamp?.toDate?.() || r.timestamp).toLocaleDateString('ar-EG'),
      feedback: r.answers.filter((a) => a.text && a.text.trim()),
    }))
    .slice(0, 10) 
})

const getNpsColor = (nps) => {
  if (nps >= 9) return 'text-green-400 bg-green-900/30'
  if (nps >= 7) return 'text-yellow-400 bg-yellow-900/30'
  return 'text-red-400 bg-red-900/30'
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, max: 5, grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
    x: { grid: { display: false }, ticks: { color: '#ffffff', font: { family: 'Cairo' } } },
  },
}

const exportToExcel = async () => {
  if (isExporting.value) return
  isExporting.value = true

  try {
    const loadingToast = showToast('جاري إعداد ملف Excel...', 'info', false)

    const data = filteredResponses.value.flatMap((response) => {
      const responseDate = new Date(response.timestamp?.toDate?.() || response.timestamp)
      const agencyName = agenciesStore.byId(response.agencyId)?.name || 'غير محدد'

      return response.answers.map((answer) => ({
        'تاريخ الرد': responseDate.toLocaleDateString('ar-EG'),
        'وقت الرد': responseDate.toLocaleTimeString('ar-EG'),
        'اسم الوكالة': agencyName,
        القسم: response.department || 'غير محدد',
        الموظف: response.employeeName || 'غير محدد',
        'تقييم NPS (من 10)': response.finalNps || 0,
        السؤال: answer.question || 'غير محدد',
        'التقييم (من 5)': answer.rating || '-',
        الملاحظات: answer.text || '-',
        الفئة: getCategoryName(answer.category) || 'غير محدد',
      }))
    })

    if (data.length === 0) {
      showToast('لا توجد بيانات للتصدير', 'warning')
      return
    }

    const wb = XLSX.utils.book_new()

    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, 'البيانات التفصيلية')

    const summaryData = [
      { المؤشر: 'إجمالي الردود', القيمة: filteredResponses.value.length },
      { المؤشر: 'متوسط NPS', القيمة: `${avgNps.value}/10` },
      { المؤشر: 'عدد الوكالات النشطة', القيمة: activeAgenciesCount.value },
      {
        المؤشر: 'فترة التقرير',
        القيمة:
          timeFilter.value === 'all'
            ? 'كل الوقت'
            : timeFilter.value === 'month'
              ? 'آخر 30 يوم'
              : 'آخر 7 أيام',
      },
      { المؤشر: 'تاريخ التصدير', القيمة: new Date().toLocaleString('ar-EG') },
      { المؤشر: 'عدد الأسئلة المجاب عليها', القيمة: data.length },
      {
        المؤشر: 'متوسط التقييم للتذاكر',
        القيمة: categoryRatingsChartData.value.datasets[0].data[0].toFixed(1),
      },
      {
        المؤشر: 'متوسط التقييم للفنادق',
        القيمة: categoryRatingsChartData.value.datasets[0].data[1].toFixed(1),
      },
      {
        المؤشر: 'متوسط التقييم للتأشيرات',
        القيمة: categoryRatingsChartData.value.datasets[0].data[2].toFixed(1),
      },
      {
        المؤشر: 'متوسط التقييم للمالية',
        القيمة: categoryRatingsChartData.value.datasets[0].data[3].toFixed(1),
      },
    ]

    const statsData = []
    const questions = questionsStore.all

    questions.forEach((question) => {
      const questionAnswers = data.filter((row) => row['السؤال'] === question.text)
      const totalAnswers = questionAnswers.length
      const ratedAnswers = questionAnswers.filter((row) => row['التقييم (من 5)'] !== '-').length
      const textAnswers = questionAnswers.filter((row) => row['الملاحظات'] !== '-').length
      const avgRating =
        ratedAnswers > 0
          ? (
              questionAnswers.reduce(
                (sum, row) => sum + (parseFloat(row['التقييم (من 5)']) || 0),
                0,
              ) / ratedAnswers
            ).toFixed(1)
          : 0

      statsData.push({
        السؤال: question.text,
        الفئة: getCategoryName(question.category),
        'إجمالي الإجابات': totalAnswers,
        'الإجابات المقيمة': ratedAnswers,
        'الإجابات النصية': textAnswers,
        'متوسط التقييم': avgRating,
        'نسبة الإجابة':
          totalAnswers > 0
            ? `${((totalAnswers / filteredResponses.value.length) * 100).toFixed(1)}%`
            : '0%',
      })
    })

    const wsStats = XLSX.utils.json_to_sheet(statsData)
    XLSX.utils.book_append_sheet(wb, wsStats, 'إحصائيات الأسئلة')

    const colWidths = [
      { wch: 12 }, 
      { wch: 10 }, 
      { wch: 20 }, 
      { wch: 15 }, 
      { wch: 20 }, 
      { wch: 15 }, 
      { wch: 40 }, 
      { wch: 15 }, 
      { wch: 50 }, 
      { wch: 15 },
    ]
    ws['!cols'] = colWidths

    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-')
    const filename = `تقرير_الاستبيانات_${timeFilter.value}_${timestamp}.xlsx`

    XLSX.writeFile(wb, filename)

    if (loadingToast) loadingToast.hide()
    showToast(`تم تصدير ${data.length} سجل بنجاح إلى ${filename}!`, 'success')
  } catch (error) {
    console.error('Export error:', error)
    showToast('حدث خطأ أثناء التصدير', 'error')
  } finally {
    isExporting.value = false
  }
}

const exportToPDF = async () => {
  if (isExporting.value) return
  isExporting.value = true

  try {
    const loadingToast = showToast('جاري إعداد ملف PDF...', 'info', false)

    if (filteredResponses.value.length === 0) {
      showToast('لا توجد بيانات للتصدير', 'warning')
      return
    }

    const doc = new jsPDF('l', 'mm', 'a4')

    doc.setFontSize(20)
    doc.text('تقرير إحصائيات الاستبيانات', 15, 20)

    doc.setFontSize(12)
    doc.text(
      `الفترة: ${timeFilter.value === 'all' ? 'كل الوقت' : timeFilter.value === 'month' ? 'آخر 30 يوم' : 'آخر 7 أيام'}`,
      15,
      35,
    )
    doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}`, 15, 45)
    doc.text(`إجمالي الردود: ${filteredResponses.value.length}`, 15, 55)
    doc.text(`متوسط NPS: ${avgNps.value}/10`, 15, 65)
    doc.text(`عدد الوكالات النشطة: ${activeAgenciesCount.value}`, 15, 75)

    const summaryTableData = [
      ['المؤشر', 'القيمة'],
      ['إجمالي الردود', filteredResponses.value.length.toString()],
      ['متوسط NPS', `${avgNps.value}/10`],
      ['عدد الوكالات النشطة', activeAgenciesCount.value.toString()],
      ['متوسط التذاكر', categoryRatingsChartData.value.datasets[0].data[0].toFixed(1)],
      ['متوسط الفنادق', categoryRatingsChartData.value.datasets[0].data[1].toFixed(1)],
      ['متوسط التأشيرات', categoryRatingsChartData.value.datasets[0].data[2].toFixed(1)],
      ['متوسط المالية', categoryRatingsChartData.value.datasets[0].data[3].toFixed(1)],
    ]

    doc.autoTable({
      startY: 85,
      head: [summaryTableData[0]],
      body: summaryTableData.slice(1),
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] },
    })

    const tableData = filteredResponses.value.slice(0, 50).map((response) => {
      const agencyName = agenciesStore.byId(response.agencyId)?.name || 'غير محدد'
      return [
        new Date(response.timestamp?.toDate?.() || response.timestamp).toLocaleDateString('ar-EG'),
        agencyName,
        response.employeeName || 'غير محدد',
        response.department || 'غير محدد',
        response.finalNps?.toString() || '0',
        response.answers.length.toString(),
      ]
    })

    doc.addPage()
    doc.setFontSize(16)
    doc.text('تفاصيل الردود (آخر 50 رد)', 15, 20)

    doc.autoTable({
      startY: 30,
      head: [['التاريخ', 'الوكالة', 'الموظف', 'القسم', 'NPS', 'عدد الإجابات']],
      body: tableData,
      theme: 'striped',
      styles: { font: 'helvetica', fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 },
        4: { cellWidth: 15 },
        5: { cellWidth: 20 },
      },
    })

    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-')
    const filename = `تقرير_الاستبيانات_${timeFilter.value}_${timestamp}.pdf`

    doc.save(filename)

    if (loadingToast) loadingToast.hide()
    showToast(`تم تصدير التقرير PDF بنجاح!`, 'success')
  } catch (error) {
    console.error('PDF Export error:', error)
    showToast('حدث خطأ أثناء تصدير PDF', 'error')
  } finally {
    isExporting.value = false
  }
}

const showDetails = (r) => (selectedResponse.value = r)

const getCategoryName = (category) => {
  const names = {
    Flight: 'التذاكر',
    Hotel: 'الفنادق',
    Visa: 'التأشيرات',
    Finance: 'المالية',
  }
  return names[category] || category || 'غير محدد'
}

const showToast = (message, type = 'info', autoHide = true) => {
  let toastContainer = document.getElementById('toast-container')
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2'
    document.body.appendChild(toastContainer)
  }

  const toast = document.createElement('div')
  toast.className = `p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 translate-x-full flex items-center gap-3 min-w-80`

  const typeConfig = {
    success: { bg: 'bg-green-600', icon: '✅' },
    error: { bg: 'bg-red-600', icon: '❌' },
    warning: { bg: 'bg-yellow-600', icon: '⚠️' },
    info: { bg: 'bg-blue-600', icon: 'ℹ️' },
  }

  const config = typeConfig[type] || typeConfig.info
  toast.classList.add(config.bg)

  toast.innerHTML = `
    <span class="text-lg">${config.icon}</span>
    <span class="flex-1">${message}</span>
    <button class="text-white/70 hover:text-white ml-2" onclick="this.parentElement.remove()">×</button>
  `

  toastContainer.appendChild(toast)

  setTimeout(() => {
    toast.classList.remove('translate-x-full')
  }, 10)

  let hideTimeout
  if (autoHide) {
    hideTimeout = setTimeout(() => {
      toast.classList.add('translate-x-full')
      setTimeout(() => toast.remove(), 300)
    }, 4000)
  }

  return {
    hide: () => {
      clearTimeout(hideTimeout)
      toast.classList.add('translate-x-full')
      setTimeout(() => toast.remove(), 300)
    },
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #1f2937;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
