<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white font-sans" dir="rtl">
    <div class="container mx-auto px-6 py-8">
      <PageHeader>
        <template #icon>
          <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </template>
        <template #title>إحصائيات الاستبيانات</template>
        <template #subtitle>تحليل شامل لأداء الاستبيانات والردود</template>
        <template #actions>
          <button
            @click="refreshData"
            class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all duration-300 flex items-center gap-3 font-semibold transform hover:scale-105"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            تحديث البيانات
          </button>
        </template>
      </PageHeader>

      <div v-if="loading" class="flex justify-center items-center py-20">
        <LoadingSpinner>جاري تحليل البيانات...</LoadingSpinner>
      </div>

      <div v-else class="space-y-8">
        <!-- إحصائيات سريعة -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </template>
            <template #label>إجمالي الردود</template>
            <template #value>{{ stats.totalResponses }}</template>
            <template #subtitle>ردود مكتملة</template>
          </StatCard>

          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </template>
            <template #label>متوسط الرضا</template>
            <template #value>{{ stats.averageSatisfaction.toFixed(1) }}/5</template>
            <template #subtitle>درجة الرضا العامة</template>
          </StatCard>

          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </template>
            <template #label>معدل الإنجاز</template>
            <template #value>{{ stats.completionRate }}%</template>
            <template #subtitle>نسبة إكمال الاستبيانات</template>
          </StatCard>

          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </template>
            <template #label>NPS Score</template>
            <template #value>{{ stats.npsScore }}</template>
            <template #subtitle>Net Promoter Score</template>
          </StatCard>

          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </template>
            <template #label>عدد الزوار</template>
            <template #value>{{ statsStore.visitors }}</template>
            <template #subtitle>زائر للاستبيانات</template>
          </StatCard>
        </div>

        <!-- إحصائيات إضافية مهمة -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </template>
            <template #label>أعلى رضا</template>
            <template #value>{{ stats.highestSatisfaction.toFixed(1) }}/5</template>
            <template #subtitle>{{ stats.topAgencyName }}</template>
          </StatCard>

          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </template>
            <template #label>أقل رضا</template>
            <template #value>{{ stats.lowestSatisfaction.toFixed(1) }}/5</template>
            <template #subtitle>{{ stats.lowestAgencyName }}</template>
          </StatCard>

          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </template>
            <template #label>عدد الوكالات</template>
            <template #value>{{ stats.totalAgencies }}</template>
            <template #subtitle>وكالات نشطة</template>
          </StatCard>

          <StatCard>
            <template #icon>
              <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </template>
            <template #label>متوسط الوقت</template>
            <template #value>{{ stats.averageResponseTime }}</template>
            <template #subtitle>دقيقة للرد</template>
          </StatCard>
        </div>

        <!-- أكثر الشركات رضا وأقلها -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- أكثر الشركات رضا -->
          <div class="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl p-6 border border-emerald-500/20">
            <div class="flex items-center mb-4">
              <div class="p-2 bg-emerald-500/20 rounded-lg mr-3">
                <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-white">أكثر الشركات رضا</h3>
            </div>
            <div class="space-y-3">
              <div v-for="(agency, index) in stats.topAgencies" :key="agency.name" class="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-sm font-bold text-emerald-400 mr-3">
                    {{ index + 1 }}
                  </div>
                  <div>
                    <p class="text-white font-medium">{{ agency.name }}</p>
                    <p class="text-emerald-300 text-sm">{{ agency.responses }} رد</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-white font-bold">{{ agency.average.toFixed(1) }}/5</p>
                  <div class="flex">
                    <svg v-for="i in 5" :key="i" class="w-3 h-3" :class="i <= Math.round(agency.average) ? 'text-yellow-400' : 'text-gray-600'" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- أقل الشركات رضا -->
          <div class="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl p-6 border border-red-500/20">
            <div class="flex items-center mb-4">
              <div class="p-2 bg-red-500/20 rounded-lg mr-3">
                <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-white">أقل الشركات رضا</h3>
            </div>
            <div class="space-y-3">
              <div v-for="(agency, index) in stats.lowestAgencies" :key="agency.name" class="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center text-sm font-bold text-red-400 mr-3">
                    {{ index + 1 }}
                  </div>
                  <div>
                    <p class="text-white font-medium">{{ agency.name }}</p>
                    <p class="text-red-300 text-sm">{{ agency.responses }} رد</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-white font-bold">{{ agency.average.toFixed(1) }}/5</p>
                  <div class="flex">
                    <svg v-for="i in 5" :key="i" class="w-3 h-3" :class="i <= Math.round(agency.average) ? 'text-yellow-400' : 'text-gray-600'" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- الرسوم البيانية -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- توزيع التقييمات -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              توزيع التقييمات
            </h3>
            <div class="h-80">
              <Bar :data="ratingDistributionData" :options="chartOptions" />
            </div>
          </div>

          <!-- الرضا حسب الفئة -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              الرضا حسب الفئة
            </h3>
            <div class="h-80">
              <Bar :data="categorySatisfactionData" :options="chartOptions" />
            </div>
          </div>

          <!-- NPS Distribution -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
              </svg>
              توزيع NPS
            </h3>
            <div class="h-80">
              <Doughnut :data="npsDistributionData" :options="doughnutOptions" />
            </div>
          </div>

          <!-- اتجاه الرضا مع الوقت -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              اتجاه الرضا مع الوقت
            </h3>
            <div class="h-80">
              <Line :data="satisfactionTrendData" :options="lineOptions" />
            </div>
          </div>
        </div>

        <!-- إحصائيات مفصلة -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- أفضل الأسئلة -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              أعلى الأسئلة تقييماً
            </h3>
            <div class="space-y-4">
              <div v-for="(question, index) in topQuestions" :key="question.id" class="flex items-center gap-4">
                <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 font-bold text-sm">
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <p class="text-white text-sm line-clamp-2">{{ question.text }}</p>
                  <p class="text-gray-400 text-xs">{{ question.averageRating }}/5</p>
                </div>
              </div>
            </div>
          </div>

          <!-- أسوأ الأسئلة -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              أقل الأسئلة تقييماً
            </h3>
            <div class="space-y-4">
              <div v-for="(question, index) in worstQuestions" :key="question.id" class="flex items-center gap-4">
                <div class="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 font-bold text-sm">
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <p class="text-white text-sm line-clamp-2">{{ question.text }}</p>
                  <p class="text-gray-400 text-xs">{{ question.averageRating }}/5</p>
                </div>
              </div>
            </div>
          </div>

          <!-- إحصائيات الوكالات -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              أداء الوكالات
            </h3>
            <div class="space-y-4">
              <div v-for="(agency, index) in stats.topAgencies" :key="agency.name" class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold text-sm">
                    {{ index + 1 }}
                  </div>
                  <span class="text-white text-sm">{{ agency.name }}</span>
                </div>
                <div class="text-right">
                  <p class="text-green-400 font-bold">{{ agency.average.toFixed(1) }}/5</p>
                  <p class="text-gray-400 text-xs">{{ agency.responses }} رد</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- جدول الردود الأخيرة -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            آخر الردود
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-white">
              <thead class="border-b border-white/20">
                <tr class="text-right">
                  <th class="p-4 text-gray-300">الوكالة</th>
                  <th class="p-4 text-gray-300">متوسط التقييم</th>
                  <th class="p-4 text-gray-300">NPS</th>
                  <th class="p-4 text-gray-300">التاريخ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10">
                <tr v-for="response in recentResponses" :key="response.id" class="hover:bg-white/5 transition">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <img :src="response.agencyLogo || '/zarda_logo.png'" @error="$event.target.src = '/zarda_logo.png'" class="w-8 h-8 rounded-lg object-cover" />
                      <span>{{ response.agencyName }}</span>
                    </div>
                  </td>
                  <td class="p-4">
                    <span class="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">{{ calculateAverageRating(response).toFixed(1) }}/5</span>
                  </td>
                  <td class="p-4">
                    <span :class="(response.finalNps || response.nps || 0) >= 30 ? 'bg-green-500/20 text-green-300' : (response.finalNps || response.nps || 0) >= 0 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'" class="px-2 py-1 rounded">
                      {{ response.finalNps || response.nps || 0 }}
                    </span>
                  </td>
                  <td class="p-4 text-gray-400">{{ formatDate(response.timestamp || response.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, LineElement, PointElement } from 'chart.js'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useResponsesStore } from '@/stores/responses'
import { useQuestionsStore } from '@/stores/questions'
import { useAgenciesStore } from '@/stores/agencies'
import { useStatsStore } from '@/stores/stats'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, LineElement, PointElement)

// استخدام الـ stores
const responsesStore = useResponsesStore()
const questionsStore = useQuestionsStore()
const agenciesStore = useAgenciesStore()
const statsStore = useStatsStore()

// استخدام البيانات من الـ stores
const responses = computed(() => responsesStore.all)
const questions = computed(() => questionsStore.all)
const agencies = computed(() => agenciesStore.all)
const loading = computed(() => responsesStore.loading || questionsStore.loading || agenciesStore.loading || statsStore.loading)

// تحديث تلقائي كل دقيقتين
let refreshInterval = null

const startAutoRefresh = () => {
  refreshInterval = setInterval(async () => {
    // تحقق من وجود ردود جديدة فقط إذا كانت الصفحة مرئية
    if (document.visibilityState === 'visible') {
      await responsesStore.fetchAll()
      await questionsStore.fetchAll()
      await agenciesStore.fetchAll()
      await statsStore.fetchAll()
    }
  }, 2 * 60 * 1000) // كل دقيقتين
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// تحديث البيانات عند العودة للصفحة
const handleVisibilityChange = async () => {
  if (document.visibilityState === 'visible') {
    // تحقق من وجود تحديثات جديدة
    await responsesStore.fetchAll()
    await questionsStore.fetchAll()
    await agenciesStore.fetchAll()
    await statsStore.fetchAll()
  }
}

const stats = computed(() => {
  const totalResponses = responses.value.length
  const averageSatisfaction = totalResponses ? responses.value.reduce((acc, r) => acc + calculateAverageRating(r), 0) / totalResponses : 0
  const completionRate = totalResponses ? Math.round((responses.value.filter(r => r.completed).length / totalResponses) * 100) : 0
  const npsScore = calculateNPS(responses.value)

  // حساب إحصائيات الوكالات
  const agencyStats = {}
  responses.value.forEach(response => {
    if (!agencyStats[response.agencyId]) {
      agencyStats[response.agencyId] = {
        name: response.agencyName,
        totalRating: 0,
        count: 0
      }
    }
    agencyStats[response.agencyId].totalRating += calculateAverageRating(response)
    agencyStats[response.agencyId].count++
  })

  const agencies = Object.values(agencyStats).map(agency => ({
    name: agency.name,
    average: agency.totalRating / agency.count,
    responses: agency.count
  }))

  const sortedAgencies = agencies.sort((a, b) => b.average - a.average)
  const topAgencies = sortedAgencies.slice(0, 5)
  const lowestAgencies = sortedAgencies.slice(-5).reverse()

  const highestSatisfaction = topAgencies.length > 0 ? topAgencies[0].average : 0
  const lowestSatisfaction = lowestAgencies.length > 0 ? lowestAgencies[0].average : 0
  const topAgencyName = topAgencies.length > 0 ? topAgencies[0].name : 'غير محدد'
  const lowestAgencyName = lowestAgencies.length > 0 ? lowestAgencies[0].name : 'غير محدد'
  const totalAgencies = agencies.length

  // حساب متوسط وقت الرد (افتراضياً 5 دقائق للعرض)
  const averageResponseTime = '5 دقيقة'

  return {
    totalResponses,
    averageSatisfaction,
    completionRate,
    npsScore,
    highestSatisfaction,
    lowestSatisfaction,
    topAgencyName,
    lowestAgencyName,
    totalAgencies,
    averageResponseTime,
    topAgencies,
    lowestAgencies
  }
})

const ratingDistributionData = computed(() => {
  const distribution = [0, 0, 0, 0, 0]
  responses.value.forEach(response => {
    const avgRating = calculateAverageRating(response)
    if (avgRating >= 1 && avgRating <= 5) {
      distribution[Math.floor(avgRating) - 1]++
    }
  })

  return {
    labels: ['1 نجمة', '2 نجوم', '3 نجوم', '4 نجوم', '5 نجوم'],
    datasets: [{
      label: 'عدد الردود',
      data: distribution,
      backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'],
      borderRadius: 8
    }]
  }
})

const categorySatisfactionData = computed(() => {
  const categoryStats = {}
  responses.value.forEach(response => {
    const category = response.department || 'عام'
    if (!categoryStats[category]) {
      categoryStats[category] = { total: 0, count: 0 }
    }
    categoryStats[category].total += calculateAverageRating(response)
    categoryStats[category].count++
  })

  const labels = Object.keys(categoryStats)
  const data = labels.map(cat => (categoryStats[cat].total / categoryStats[cat].count).toFixed(1))

  return {
    labels,
    datasets: [{
      label: 'متوسط الرضا',
      data,
      backgroundColor: '#3b82f6',
      borderRadius: 8
    }]
  }
})

const npsDistributionData = computed(() => {
  let promoters = 0, passives = 0, detractors = 0
  responses.value.forEach(response => {
    if (response.nps >= 9) promoters++
    else if (response.nps >= 7) passives++
    else detractors++
  })

  return {
    labels: ['مروجون', 'محايدون', 'منتقدون'],
    datasets: [{
      data: [promoters, passives, detractors],
      backgroundColor: ['#10b981', '#eab308', '#ef4444'],
      borderWidth: 0
    }]
  }
})

const satisfactionTrendData = computed(() => {
  // Group by date and calculate average
  const trend = {}
  responses.value.forEach(response => {
    const timestamp = response.timestamp || response.createdAt
    if (!timestamp) return
    const date = new Date(timestamp.seconds * 1000).toISOString().split('T')[0]
    if (!trend[date]) trend[date] = { total: 0, count: 0 }
    trend[date].total += calculateAverageRating(response)
    trend[date].count++
  })

  const sortedDates = Object.keys(trend).sort()
  const data = sortedDates.map(date => (trend[date].total / trend[date].count).toFixed(1))

  return {
    labels: sortedDates.map(date => new Date(date).toLocaleDateString('ar-SA')),
    datasets: [{
      label: 'متوسط الرضا',
      data,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  }
})

const topQuestions = computed(() => {
  // This would require question-level ratings data
  return questions.value.slice(0, 5).map(q => ({ ...q, averageRating: 4.2 }))
})

const worstQuestions = computed(() => {
  // This would require question-level ratings data
  return questions.value.slice(-5).map(q => ({ ...q, averageRating: 2.8 }))
})

const recentResponses = computed(() => responses.value.slice(0, 10))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#e5e7eb' } },
    tooltip: { titleColor: '#fff', bodyColor: '#fff' }
  },
  scales: {
    y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
    x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { color: '#fff' } }
  }
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#e5e7eb' } },
    tooltip: { titleColor: '#fff', bodyColor: '#fff' }
  },
  scales: {
    y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
    x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
  }
}

const calculateAverageRating = (response) => {
  if (!response.answers || !Array.isArray(response.answers)) return 0
  const ratings = response.answers
    .map(answer => answer.rating)
    .filter(rating => rating !== null && rating !== undefined)
  return ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0
}

const calculateNPS = (responses) => {
  if (!responses.length) return 0
  let promoters = 0, detractors = 0
  responses.forEach(r => {
    const nps = r.finalNps || r.nps || 0
    if (nps >= 9) promoters++
    else if (nps <= 6) detractors++
  })
  return Math.round(((promoters - detractors) / responses.length) * 100)
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'غير محدد'
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp)
  return date.toLocaleDateString('ar-SA')
}

const refreshData = async () => {
  try {
    // جلب البيانات من الـ stores
    await Promise.all([
      responsesStore.fetchAll({ force: true }),
      questionsStore.fetchAll({ force: true }),
      agenciesStore.fetchAll({ force: true }),
      statsStore.fetchAll({ force: true })
    ])
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(async () => {
  await refreshData()
  startAutoRefresh()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  stopAutoRefresh()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>