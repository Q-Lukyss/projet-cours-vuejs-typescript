<template>
  <footer class="relative pt-8 pb-6">
    <div class="container mx-auto px-4">
      <hr class="my-6 border-text-darkblue">
      <div class="flex flex-wrap items-center md:justify-between justify-center">
        <div class="w-full md:w-4/12 px-4 mx-auto text-center">
          <div class="text-sm text-darkblue font-semibold py-1">
            Copyright © <span id="get-current-year">{{ date }}</span>
            <a href="https://github.com/Q-Lukyss" target="_blank" class="text-violet">
              Quentin Lachery
            </a>.
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const date = new Date().getFullYear();
</script>

<style scoped>

</style>