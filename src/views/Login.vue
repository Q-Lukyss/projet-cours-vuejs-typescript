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
import { db } from '@/services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { type User } from '@/types/users';
import router from "@/router";

const email = ref('');
const password = ref('');
const errorMessage = ref('');

const handleLogin = async () => {
    try {
    // Rechercher l'utilisateur correspondant à l'email et au mot de passe
    const usersCollection = collection(db, 'Users');
    const q = query(usersCollection, where('email', '==', email.value), where('password', '==', password.value));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const user: User = querySnapshot.docs[0].data() as User;
        console.log('Utilisateur connecté :', user);
        // Redirigez l'utilisateur ou effectuez une autre action ici
        router.push("/dashboard")
    } else {
        errorMessage.value = 'Email ou mot de passe incorrect.';
    }
    } catch (error: any) {
        errorMessage.value = 'Erreur lors de la connexion. Veuillez réessayer.';
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
