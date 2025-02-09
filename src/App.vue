<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from "@/components/Navbar.vue";
</script>

<template>
    <Navbar/>
    <h1 class="text-8xl font-bold underline">Oy</h1>

  <RouterView />
</template>

<style scoped>

</style>
