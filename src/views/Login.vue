<template>
  <div class="flex min-h-screen items-center justify-center bg-darkblue">
    <div class="w-full max-w-md bg-beige p-8 rounded-2xl shadow-lg">
      <h1 class="text-2xl font-bold text-center text-darkblue">Connexion</h1>
      <form @submit.prevent="handleLogin" class="mt-6">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-darkblue">Email :</label>
          <input v-model="email" type="email" id="email" required
                 class="w-full p-3 mt-1 rounded-lg border border-lightviolet focus:ring-2 focus:ring-violet focus:outline-none" />
        </div>
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-darkblue">Mot de passe :</label>
          <input v-model="password" type="password" id="password" required
                 class="w-full p-3 mt-1 rounded-lg border border-lightviolet focus:ring-2 focus:ring-violet focus:outline-none" />
        </div>
        <button type="submit"
                class="w-full p-3 mt-4 bg-violet text-lightbeige hover:text-darkblue font-bold rounded-lg hover:bg-lightviolet transition">
          Se connecter
        </button>
        <p v-if="errorMessage" class="mt-3 text-red-500 text-center">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { db, auth } from '@/services/firebase';
import {doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { type User } from '@/types/users';
import router from "@/router";
import {useAuthStore} from "@/stores/auth.ts";

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const authStore = useAuthStore();

const handleLogin = async () => {
  try {
    // Authentification avec Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;
    console.log('Utilisateur connecté :', user);

    // Récupérer le document de l'utilisateur dans Firestore
    // On suppose ici que chaque document utilisateur est identifié par l'uid de l'utilisateur
    const userDocRef = doc(db, 'Users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const statut = userData.statut; // Assurez-vous que ce champ existe dans votre document

      authStore.setUser({
        uid: user.uid,
        email: user.email!,
        statut: userData.statut // Assure-toi que 'statut' existe dans ton document
      });

      // Redirection en fonction du statut
      if (statut === 0) {
        await router.push("/dashboard");
      } else if (statut === 5) {
        await router.push("/dashboard-intervenant");
      } else if (statut === 10) {
        await router.push("/dashboard-administratif");
      } else {
        errorMessage.value = 'Statut utilisateur inconnu.';
      }
    } else {
      errorMessage.value = "Aucun profil trouvé pour cet utilisateur.";
    }
  } catch (error: any) {
    errorMessage.value = 'Email ou mot de passe incorrect.';
    console.error(error);
  }
};
</script>

<style scoped>

</style>
