<template>
  <div v-if="!loading">
    <Slider :contents="contents" />
    <div class="footer">
      <Marquee
        v-if="program.marquee"
        :marquee="program.marquee"
        direction="left"
        height="100px"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: ["program"],
  components: {
    Slider: () => import("../components/Slider"),
    Marquee: () => import("../components/Marquee.vue"),
  },
  data() {
    return {
      loading: true,
      contents: [],
    };
  },
  methods: {
    fetchContents() {
      // make api call to fetch contents oof the program
      this.$axios
        .get(`programs/${this.program.program_id}/contents`)
        .then((response) => {
          console.log(response.data);
          this.contents = response.data.contents;
          this.loading = false;
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
  created() {
    this.fetchContents();
  },
};
</script>

<style scoped>
.footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  text-align: center;
  height: 50px;
}
</style>
