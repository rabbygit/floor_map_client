<template>
  <v-app>
    <v-main>
      <component :is="$route.meta.layout || 'div'">
        <router-view />
      </component>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
.v-application--wrap {
  flex-direction: row !important;
}
</style>
