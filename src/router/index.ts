import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from "@/stores/auth";
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
    // Etudiant
  {
    path: '/dashboard',
    name: 'DashboardEtudiant',
    component: () => import('../views/Etudiant/HomeEtudiant.vue'),
    meta: { allowedStatuses: [0] }
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
  {
    path: '/calendrier-etudiant',
    name: 'CalendrierEtudiant',
    component: () => import('../views/Etudiant/Calendrier.vue'),
    meta: { allowedStatuses: [0] }
  },
  // Intervenant
  {
    path: '/dashboard-intervenant',
    name: 'DashboardIntervenant',
    component: () => import('../views/Intervenant/HomeIntervenant.vue'),
    meta: { allowedStatuses: [5] }
  },
  {
    path: '/formation-intervenant',
    name: 'FormationIntervenant',
    component: () => import('../views/Intervenant/Formation.vue'),
    meta: { allowedStatuses: [5] }
  },
  {
    path: '/support-cours-intervenant',
    name: 'SupportIntervenant',
    component: () => import('../views/Intervenant/SupportCours.vue'),
    meta: { allowedStatuses: [5] }
  },
  {
    path: '/note-intervenant',
    name: 'NoteIntervenant',
    component: () => import('../views/Intervenant/Note.vue'),
    meta: { allowedStatuses: [5] }
  },
  // Administratif
  {
    path: '/dashboard-administratif',
    name: 'DashboardAdministratif',
    component: () => import('../views/Administratif/HomeAdministratif.vue'),
    meta: { allowedStatuses: [10] }
  },
  {
    path: '/absences',
    name: 'AbsenceAdministratif',
    component: () => import('../views/Administratif/Absence.vue'),
    meta: { allowedStatuses: [10] }
  },
  {
    path: '/news',
    name: 'NewsAdministratif',
    component: () => import('../views/Administratif/News.vue'),
    meta: { allowedStatuses: [10] }
  },
  {
    path: '/utilisateurs',
    name: 'UtilisateursAdministratif',
    component: () => import('../views/Administratif/Utilisateur.vue'),
    meta: { allowedStatuses: [10] }
  },
  {
    path: '/formation',
    name: 'FormationAdministratif',
    component: () => import('../views/Administratif/Formation.vue'),
    meta: { allowedStatuses: [10] }
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Fonction qui attend que l'état d'authentification soit connu
function waitForAuth() {
  return new Promise((resolve) => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

router.beforeEach(async (to, from, next) => {
  // Attendre que l'état d'authentification soit déterminé
  await waitForAuth();

  const authStore = useAuthStore();
  const allowedStatuses = to.meta.allowedStatuses as number[] | undefined;

  if (allowedStatuses) {
    // Si l'utilisateur est connecté et que son statut figure dans les statuts autorisés, on autorise l'accès
    if (authStore.user && allowedStatuses.includes(authStore.user.statut)) {
      next();
    } else {
      // Sinon, redirection vers la page de login
      next({ name: 'Login' });
    }
  } else {
    next();
  }
});

export default router;
