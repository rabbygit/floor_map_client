<template>
  <div>
    <marquee width="100%" :direction="direction" :height="height">
      {{ marquee }}
    </marquee>
  </div>
</template>

<script>
export default {
  props: ["marquee", "direction", "height"],
};
</script>

<style>
</style>