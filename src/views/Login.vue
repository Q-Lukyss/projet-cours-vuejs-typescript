<template>
  <div class="login-container">
    <h1>Connexion</h1>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="email">Email :</label>
        <input v-model="email" type="email" id="email" required />
      </div>
      <div>
        <label for="password">Mot de passe :</label>
        <input v-model="password" type="password" id="password" required />
      </div>
      <button type="submit">Se connecter</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
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
.login-container {
max-width: 400px;
margin: 0 auto;
padding: 1rem;
border: 1px solid #ccc;
border-radius: 5px;
box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
label {
display: block;
margin-bottom: 0.5rem;
}
input {
width: 100%;
padding: 0.5rem;
margin-bottom: 1rem;
border: 1px solid #ccc;
border-radius: 5px;
}
button {
width: 100%;
padding: 0.5rem;
background-color: #007bff;
color: white;
border: none;
border-radius: 5px;
cursor: pointer;
}
button:hover {
background-color: #0056b3;
}
.error {
color: red;
margin-top: 0.5rem;
}
</style>
