

<template>
  <NavbarEtudiant v-if="userStatut === 0 && showNavbarAndFooter" />
  <NavbarIntervenant v-else-if="userStatut === 5 && showNavbarAndFooter" />
  <NavbarAdministratif v-else-if="userStatut === 10 && showNavbarAndFooter" />

  <RouterView />
  <Footer v-if="showNavbarAndFooter"/>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router';
import {computed} from "vue";

import NavbarEtudiant from "@/components/NavbarEtudiant.vue";
import NavbarIntervenant from "@/components/NavbarIntervenant.vue";
import NavbarAdministratif from "@/components/NavbarAdministratif.vue";
import {useAuthStore} from "@/stores/auth.ts";
import Footer from "@/components/Footer.vue";

const authStore = useAuthStore();
const route = useRoute();

const showNavbarAndFooter = computed(() => {
  return (route.path !== '/');  // Navbar masquée sur la route '/' et '/sign-up'
});

const userStatut = computed(() => authStore.user ? authStore.user.statut : null);
</script>

<style scoped>

</style>
