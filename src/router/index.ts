import {createRouter, createWebHistory} from 'vue-router'
import type {RouteRecordRaw} from 'vue-router'
import {useAuthStore} from "@/stores/auth.ts";


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/dashboard',
    name: 'DashboardEtudiant',
    component: () => import('../views/Etudiant/HomeEtudiant.vue'),
    meta: { allowedStatuses: [0] }
  },
  {
    path: '/dashboard-intervenant',
    name: 'DashboardIntervenant',
    component: () => import('../views/Intervenant/HomeIntervenant.vue'),
    meta: { allowedStatuses: [5] }
  },
  {
    path: '/dashboard-administratif',
    name: 'DashboardAdministratif',
    component: () => import('../views/Administratif/HomeAdministratif.vue'),
    meta: { allowedStatuses: [10] }
  },
  {
    path: '/note',
    name: 'Note',
    component: () => import('../views/Etudiant/Note.vue'),
    meta: { allowedStatuses: [0] }
  },
  {
    path: '/presence',
    name: 'Presence',
    component: () => import('../views/Etudiant/Presence.vue'),
    meta: { allowedStatuses: [0] }
  },
  {
    path: '/administratif',
    name: 'Administratif',
    component: () => import('../views/Etudiant/Administratif.vue'),
    meta: { allowedStatuses: [0] }
  },
  {
    path: '/support-cours',
    name: 'Support Cours',
    component: () => import('../views/Etudiant/SupportCours.vue'),
    meta: { allowedStatuses: [0] }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const allowedStatuses = to.meta.allowedStatuses as number[] | undefined;

  // Si la route a une restriction de statut
  if (allowedStatuses) {
    // Vérifier que l'utilisateur est connecté et a un statut valide
    if (authStore.user && allowedStatuses.includes(authStore.user.statut)) {
      next();
    } else {
      // Rediriger vers la page de connexion ou une page d'erreur
      next({ name: 'Login' });
    }
  } else {
    next();
  }
});

export default router
