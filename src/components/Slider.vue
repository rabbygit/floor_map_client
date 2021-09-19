<template>
  <v-carousel
    hide-delimiters
    cycle
    :show-arrows="false"
    :interval="interval"
    v-model="model"
    @change="onChange"
  >
    <v-carousel-item v-for="(content, i) in contents" :key="i">
      <v-img
        v-if="content.content_type === 'image'"
        :src="$axios.defaults.baseURL + content.url"
      >
      </v-img>
      <iframe
        allowfullscreen="true"
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        v-if="content.content_type === 'video'"
        :src="content.url + '?autoplay=1&mute=1'"
        width="100%"
        height="500px"
      >
      </iframe>
      <!-- :src="content.url + '?autoplay=1&mute=1'" -->
    </v-carousel-item>
  </v-carousel>
</template>

<script>
export default {
  props: ["contents"],
  data: () => ({
    model: 0,
    interval: 0,
  }),
  methods: {
    onChange() {
      // Change interval time according to content
      this.interval = this.contents[this.model].delay_time || 6000;
    },
  },
  created() {
    // Set initial interval time
    if (Array.isArray(this.contents) && this.contents.length) {
      this.interval = this.contents[0].delay_time || 6000;
    }
  },
};
</script>

<style scoped>
@media screen and (max-width: 750px) {
  iframe {
    max-width: 100% !important;
    width: auto !important;
    height: auto !important;
  }
}
</style>