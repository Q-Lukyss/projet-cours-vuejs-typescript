import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from "@/stores/auth";

// Pour eviter l'erreur de Build
declare module 'vue-router' {
  interface RouteMeta {
    allowedStatuses?: number[];
    requiresAuth?: boolean;
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
    // Etudiant
  {
    path: '/dashboard',
    name: 'DashboardEtudiant',
    component: () => import('@/views/Etudiant/HomeEtudiant.vue'),
    meta: {
      allowedStatuses: [0],
      requiresAuth: true
    }
  },
  {
    path: '/note',
    name: 'Note',
    component: () => import('@/views/Etudiant/Note.vue'),
    meta: {
      allowedStatuses: [0],
      requiresAuth: true
    }
  },
  {
    path: '/presence',
    name: 'Presence',
    component: () => import('@/views/Etudiant/Presence.vue'),
    meta: {
      allowedStatuses: [0],
      requiresAuth: true
    }
  },
  {
    path: '/administratif',
    name: 'Administratif',
    component: () => import('@/views/Etudiant/Administratif.vue'),
    meta: {
      allowedStatuses: [0],
      requiresAuth: true
    }
  },
  {
    path: '/support-cours',
    name: 'Support Cours',
    component: () => import('@/views/Etudiant/SupportCours.vue'),
    meta: {
      allowedStatuses: [0],
      requiresAuth: true
    }
  },
  {
    path: '/calendrier-etudiant',
    name: 'CalendrierEtudiant',
    component: () => import('@/views/Etudiant/Calendrier.vue'),
    meta: {
      allowedStatuses: [0],
      requiresAuth: true
    }
  },
  // Intervenant
  {
    path: '/dashboard-intervenant',
    name: 'DashboardIntervenant',
    component: () => import('@/views/Intervenant/HomeIntervenant.vue'),
    meta: {
      allowedStatuses: [5],
      requiresAuth: true
    }
  },
  {
    path: '/formation-intervenant',
    name: 'FormationIntervenant',
    component: () => import('@/views/Intervenant/Formation.vue'),
    meta: {
      allowedStatuses: [5],
      requiresAuth: true
    }
  },
  {
    path: '/support-cours-intervenant',
    name: 'SupportIntervenant',
    component: () => import('@/views/Intervenant/SupportCours.vue'),
    meta: {
      allowedStatuses: [5],
      requiresAuth: true
    }
  },
  {
    path: '/note-intervenant',
    name: 'NoteIntervenant',
    component: () => import('@/views/Intervenant/Note.vue'),
    meta: {
      allowedStatuses: [5],
      requiresAuth: true
    }
  },
  // Administratif
  {
    path: '/dashboard-administratif',
    name: 'DashboardAdministratif',
    component: () => import('@/views/Administratif/HomeAdministratif.vue'),
    meta: {
      allowedStatuses: [10],
      requiresAuth: true
    }
  },
  {
    path: '/absences',
    name: 'AbsenceAdministratif',
    component: () => import('@/views/Administratif/Absence.vue'),
    meta: {
      allowedStatuses: [10],
      requiresAuth: true
    }
  },
  {
    path: '/news',
    name: 'NewsAdministratif',
    component: () => import('@/views/Administratif/News.vue'),
    meta: {
      allowedStatuses: [10],
      requiresAuth: true
    }
  },
  {
    path: '/utilisateurs',
    name: 'UtilisateursAdministratif',
    component: () => import('@/views/Administratif/Utilisateur.vue'),
    meta: {
      allowedStatuses: [10],
      requiresAuth: true
    }
  },
  {
    path: '/formation',
    name: 'FormationAdministratif',
    component: () => import('@/views/Administratif/Formation.vue'),
    meta: {
      allowedStatuses: [10],
      requiresAuth: true
    }
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
});


router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Attendre que l'état d'authentification soit initialisé
  while (!authStore.isInitialized) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Si la route ne requiert pas d'authentification, on passe
  if (!to.meta.requiresAuth) {
    return next();
  }

  // Pour une route protégée, si l'utilisateur est connecté
  if (authStore.user) {
    if (to.meta.allowedStatuses && !to.meta.allowedStatuses.includes(authStore.user.statut)) {
      return next({ name: 'Login', replace: true });
    }
    return next();
  } else {
    // Si l'utilisateur n'est pas connecté, rediriger vers Login (replace pour ne pas polluer l'historique).
    return next({ name: 'Login', replace: true });
  }
});

export default router;
