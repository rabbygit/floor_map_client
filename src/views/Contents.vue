<template>
  <v-card>
    <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" width="500">
        <template v-slot:activator="{ on, attrs }">
          <v-btn class="mx-2" fab dark color="primary" v-bind="attrs" v-on="on">
            <v-icon dark> mdi-plus </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="text-h5 primary white--text" dark>
            New Content
            <v-spacer></v-spacer>
            <v-btn icon dark @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-form ref="form" v-model="valid">
              <v-select
                :items="programs"
                v-model="program"
                :rules="[(v) => !!v || 'Program is required!']"
                label="Select Program"
                item-text="program_name"
                item-value="program_id"
                required
              ></v-select>

              <v-select
                :items="types"
                v-model="content_type"
                :rules="[(v) => !!v || 'Content Type is required!']"
                label="Content Type"
                required
              ></v-select>

              <v-text-field
                v-if="content_type === 'video'"
                v-model="url"
                :rules="[(v) => !!v || 'Video url is required!']"
                label="Video url"
                required
              ></v-text-field>

              <v-file-input
                v-else-if="content_type === 'pptx'"
                required
                v-model="pptx"
                :rules="[(v) => !!v || 'pptx file is required!']"
              ></v-file-input>

              <v-file-input
                v-else
                chips
                required
                multiple
                v-model="files"
                :rules="[(v) => !!v || 'Image/Images are required!']"
              ></v-file-input>

              <v-text-field
                v-model.number="delay_time"
                :messages="
                  content_type === 'video'
                    ? 'To display the whole video,screen time should be greater than video length'
                    : `Image will be displayed for ${delay_time} seconds`
                "
                label="Screen Time(seconds)"
                required
                :rules="[(v) => !!v || 'Content screen time is required!']"
              ></v-text-field>

              <v-textarea
                class="mt-2"
                name="input-5-1"
                label="Word Text"
                v-model="text"
                outlined
              ></v-textarea>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              :loading="uploading"
              @click="createContent"
              :disabled="!valid"
              >Create
              <template v-slot:loader>
                <span class="custom-loader">
                  <v-icon dark>mdi-cached</v-icon>
                </span>
              </template>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="contents"
      :search="search"
      :loading="loading"
      loading-text="Loading... Please wait"
      single-expand
      show-expand
      item-key="content_id"
    >
      <template v-slot:[`item.update`]="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
          class="ma-2"
          outlined
          color="primary"
          dark
          small
          @click="editItem(item)"
        >
          Active
        </v-btn>
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length" class="pa-5">
          <div>Contents:</div>

          <div class="d-flex flex-wrap">
            <div v-for="(content, index) in item.contents_urls" :key="index">
              <v-img
                v-if="content.content_type === 'image'"
                :src="$axios.defaults.baseURL + content.url"
                height="200"
                max-width="200"
                class="ma-2"
              >
              </v-img>
              <iframe
                v-if="content.content_type === 'video'"
                width="200"
                height="200"
                :src="content.url"
              >
              </iframe>
            </div>
          </div>
          <div v-if="item.text">
            <div>Text</div>
            {{ item.text }}
          </div>
        </td>
      </template>
    </v-data-table>

    <v-snackbar v-model="snackbar">
      {{ snackbar_text }}

      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>


<script>
export default {
  data() {
    return {
      valid: false,
      loading: true,
      dialog: false,
      uploading: false,
      snackbar: false,
      snackbar_text: "",
      types: ["image", "video", "pptx"],
      search: "",
      headers: [
        {
          text: "Program",
          align: "start",
          sortable: false,
          value: "program_name",
        },
        { text: "Content Type", value: "content_type" },
        { text: "", value: "data-table-expand" },
      ],
      contents: [],
      programs: [],

      program: "",
      content_type: "image",
      url: "",
      text: "",
      delay_time: 6,
      files: [],
      pptx: null,
    };
  },
  methods: {
    isValidImage(file) {
      const type = file.type.split("/").pop();
      const validTypes = ["jpg", "jpeg", "png", "pdf"];
      if (validTypes.indexOf(type) === -1) {
        return false;
      }
      return true;
    },
    isValidPPT(file) {
      console.log(file);
      const type = file.name.split(".").pop();
      console.log({ type });
      return !["pptx", "ppt"].includes(type) ? false : true;
    },
    fetchPrograms() {
      this.$axios
        .get("programs")
        .then((response) => {
          const { programs } = response.data;
          this.programs = programs;
          this.loading = false;
        })
        .catch((err) => {
          console.error(err);
        });
    },
    fetchContents() {
      this.$axios
        .get("contents")
        .then((response) => {
          let { contents = [] } = response.data;
          this.contents = contents;
          this.loading = false;
        })
        .catch((err) => {
          this.loading = [];
          this.loading = false;
          console.error(err);
        });
    },
    createContent() {
      if (this.content_type === "video") {
        // Create payload
        let new_content = {
          program_id: this.program,
          content_type: this.content_type,
          url: this.url,
          text: this.text,
          delay_time: this.delay_time,
        };

        this.apiCall(new_content);
      } else {
        // Handle form data
        let formData = new FormData();

        if (this.content_type === "pptx") {
          // check ppt file and append it to formdata
          if (!this.isValidPPT(this.pptx)) {
            this.pptx = null;
            this.snackbar_text = "Only pptx file is allowed";
            this.snackbar = true;
            return;
          }
          // append the ppt file
          formData.append("pptx", this.pptx);
        } else {
          // Check image types and append to formdata
          for (let i = 0; i < this.files.length; i++) {
            let file = this.files[i];
            // Check file type
            if (!this.isValidImage(file)) {
              this.files = [];
              this.snackbar_text = "Only jpg/jpeg/png image are allowed";
              this.snackbar = true;
              return;
            }
            formData.append("files", file);
          }
        }

        // Append other fields
        formData.append("program_id", this.program);
        formData.append("content_type", this.content_type);
        formData.append("text", this.text);
        formData.append("delay_time", this.delay_time);
        this.apiCall(formData);
      }
    },
    apiCall(payload = {}) {
      let headers = {};
      // Add headers for file type
      if (this.content_type !== "video") {
        headers = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
      }

      // loading state
      this.uploading = true;

      this.$axios
        .post("contents", payload, headers)
        .then((response) => {
          this.uploading = false;
          this.dialog = false;
          this.$refs.form.reset();
          this.fetchContents(); // call new contents
          this.snackbar_text = response.data.message;
          this.snackbar = true;
        })
        .catch((err) => {
          this.uploading = false;
          this.snackbar_text = err.response.data.message;
          this.snackbar = true;
        });
    },
  },
  created() {
    this.fetchPrograms();
    this.fetchContents();
  },
};
</script>

<style scoped>
.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}
@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-o-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>