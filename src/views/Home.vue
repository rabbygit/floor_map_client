<template>
  <div>
    <Spinner v-if="loading" />
    <component :is="layout" :program="program" v-else-if="found"></component>
    <Error v-else />
  </div>
</template>

<script>
import socket from "../socket";

export default {
  name: "Home",
  components: {
    Spinner: () => import("../components/Spinner.vue"),
    Error: () => import("../components/Error.vue"),
    layout1: () => import("../components/layout1"),
    layout2: () => import("../components/layout2"),
    layout3: () => import("../components/layout3"),
  },
  data() {
    return {
      loading: true,
      found: false,
      layout: "",
      program: {},
    };
  },
  methods: {
    fetchDevice() {
      // Make api call to fetch related information like layout and other data
      this.$axios
        .get(`devices/url?url=${window.location.href}`)
        .then((response) => {
          let { device } = response.data;
          this.program = device.programs;
          this.layout = this.program.layout;
          if (this.layout) {
            this.found = true;
          }
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
  },
  created() {
    // Make initial api call
    this.fetchDevice();

    // Listen on socket event for content change
    socket.on("content_change", (program) => {
      if (program.program_id == this.program.program_id) {
        location.reload();
      }
    });
  },
};
</script>
