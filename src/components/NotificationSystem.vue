<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-2xl max-w-sm"
        :class="getNotificationClasses(notification.type)"
      >
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <component :is="getNotificationIcon(notification.type)" class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-white text-sm">{{ notification.title }}</h4>
            <p class="text-slate-300 text-sm mt-1">{{ notification.message }}</p>
          </div>
          <button
            @click="removeNotification(notification.id)"
            class="text-slate-400 hover:text-white transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="mt-3 bg-white/20 rounded-full h-1">
          <div
            class="h-full rounded-full transition-all duration-100"
            :class="getProgressColor(notification.type)"
            :style="{ width: `${notification.progress}%` }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const notifications = ref([])

const addNotification = (title, message, type = 'info', duration = 5000) => {
  const id = Date.now()
  const notification = {
    id,
    title,
    message,
    type,
    progress: 100,
    duration
  }

  notifications.value.push(notification)

  const interval = setInterval(() => {
    notification.progress -= 100 / (duration / 100)
    if (notification.progress <= 0) {
      removeNotification(id)
      clearInterval(interval)
    }
  }, 100)
}

const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const getNotificationClasses = (type) => {
  const classes = {
    success: 'border-green-400/20',
    error: 'border-red-400/20',
    warning: 'border-yellow-400/20',
    info: 'border-blue-400/20'
  }
  return classes[type] || classes.info
}

const getProgressColor = (type) => {
  const colors = {
    success: 'bg-green-400',
    error: 'bg-red-400',
    warning: 'bg-yellow-400',
    info: 'bg-blue-400'
  }
  return colors[type] || colors.info
}

const getNotificationIcon = (type) => {
  const icons = {
    success: 'CheckCircleIcon',
    error: 'XCircleIcon',
    warning: 'ExclamationTriangleIcon',
    info: 'InformationCircleIcon'
  }
  return icons[type] || icons.info
}

defineExpose({ addNotification })

onMounted(() => {
  return () => {
    notifications.value = []
  }
})
</script>

<style scoped>
.notification-enter-active, .notification-leave-active {
  transition: all 0.3s ease;
}
.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>