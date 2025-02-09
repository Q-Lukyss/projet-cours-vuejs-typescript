import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
    },
    {
      path: '/note',
      name: 'Note',
      component: () => import('../views/Note.vue'),
    },
    {
      path: '/presence',
      name: 'Presence',
      component: () => import('../views/Presence.vue'),
    },
    {
      path: '/administratif',
      name: 'Administratif',
      component: () => import('../views/Administratif.vue'),
    },
    {
      path: '/support-cours',
      name: 'Support Cours',
      component: () => import('../views/SupportCours.vue'),
    },
  ],
})

export default router
