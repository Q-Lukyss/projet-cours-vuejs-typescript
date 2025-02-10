<template>
  <!-- NavbarEtudiant -->
  <nav class="bg-violet text-lightbeige">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <img class="h-auto w-12" src="@/assets/img/school-svgrepo-com.svg" alt="Your Company" />
          </div>
        </div>

        <!-- Menu de navigation (desktop) -->
        <div class="hidden lg:flex space-x-4">
          <router-link
              :class="isActive('/dashboard-intervenant') ? 'bg-darkblue text-white' : 'text-gray-300 hover:bg-darkblue hover:text-white'"
              to="/dashboard-intervenant"
              class="rounded-md px-3 py-2 text-m font-medium"
          >
            Tableau de Bord
          </router-link>
          <router-link
              :class="isActive('/formation-intervenant') ? 'bg-darkblue text-white' : 'text-gray-300 hover:bg-darkblue hover:text-white'"
              to="/formation-intervenant"
              class="rounded-md px-3 py-2 text-m font-medium"
          >
            Mes Classes
          </router-link>
          <router-link
              :class="isActive('/support-cours-intervenant') ? 'bg-darkblue text-white' : 'text-gray-300 hover:bg-darkblue hover:text-white'"
              to="/support-cours-intervenant"
              class="rounded-md px-3 py-2 text-m font-medium"
          >
            Support de Cours
          </router-link>
          <router-link
              :class="isActive('/note-intervenant') ? 'bg-darkblue text-white' : 'text-gray-300 hover:bg-darkblue hover:text-white'"
              to="/note-intervenant"
              class="rounded-md px-3 py-2 text-m font-medium"
          >
            Notes
          </router-link>
        </div>

        <!-- Bouton Déconnexion (toujours visible) -->
        <div class="hidden lg:flex items-center">
          <router-link
              :class="isActive('/logout') ? 'bg-darkblue text-white' : 'text-gray-300 hover:bg-darkblue hover:text-white'"
              to="/logout"
              class="rounded-md px-3 py-2 text-m font-medium"
          >
            Déconnexion
          </router-link>
        </div>

        <!-- Bouton Burger (mobile uniquement) -->
        <button
            @click="isOpen = !isOpen"
            class="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-darkblue focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-controls="mobile-menu"
            aria-expanded="false"
        >
          <span class="sr-only">Ouvrir le menu</span>
          <!-- Icône Burger -->
          <svg
              v-if="!isOpen"
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <!-- Icône Fermer -->
          <svg
              v-else
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Menu mobile (visible uniquement si isOpen est vrai) -->
    <div :class="isOpen ? 'block' : 'hidden'" class="lg:hidden bg-gray-800" id="mobile-menu">
      <div class="space-y-1 px-2 pt-2 pb-3">
        <router-link
            :class="isActive('/dashboard') ? 'bg-darkblue text-white' : 'text-gray-300 hover:bg-darkblue hover:text-white'"
            to="/dashboard"
            class="block rounded-md px-3 py-2 text-base font-medium"
        >
          Tableau de Bord
        </router-link>
        <router-link
            :class="isActive('/formation-intervenant') ? 'bg-darkblue text-white' : 'text-gray-300 hover:bg-darkblue hover:text-white'"
            to="/formation-intervenant"
            class="rounded-md px-3 py-2 text-m font-medium"
        >
          Mes Classes
        </router-link>
        <router-link
            :class="isActive('/support-cours-intervenant') ? 'bg-darkblue text-white' : 'text-gray-300 hover:bg-darkblue hover:text-white'"
            to="/support-cours-intervenant"
            class="rounded-md px-3 py-2 text-m font-medium"
        >
          Support de Cours
        </router-link>
        <router-link
            :class="isActive('/note-intervenant') ? 'bg-darkblue text-white' : 'text-gray-300 hover:bg-darkblue hover:text-white'"
            to="/note-intervenant"
            class="rounded-md px-3 py-2 text-m font-medium"
        >
          Notes
        </router-link>
        <router-link
            :class="isActive('/logout') ? 'bg-darkblue text-white' : 'text-gray-300 hover:bg-darkblue hover:text-white'"
            to="/logout"
            class="block rounded-md px-3 py-2 text-base font-medium"
        >
          Déconnexion
        </router-link>
      </div>
    </div>
  </nav>
</template>



<script setup lang="ts">
import {useRoute} from 'vue-router';
import {computed, onMounted, ref, watch} from 'vue';

const isOpen = ref(false); // Variable pour gérer l'état du menu mobile
const route = useRoute();


// Fonction qui vérifie si la route est active
const isActive = (path : string) => {
  return computed(() => route.path === path).value;
};


onMounted(async () => {

})

</script>

<style scoped>
nav {
  /* Styles globaux du menu de navigation */
}
</style>