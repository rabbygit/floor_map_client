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
      <v-dialog v-model="dialog" width="650">
        <template v-slot:activator="{ on, attrs }">
          <v-btn class="mx-2" fab dark color="primary" v-bind="attrs" v-on="on">
            <v-icon dark> mdi-plus </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="text-h5 primary white--text" dark>
            New Program
            <v-spacer></v-spacer>
            <v-btn icon dark @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid">
              <v-select
                v-model="selected_devices"
                :items="devices"
                item-text="url"
                item-value="device_id"
                attach
                chips
                label="Select devices"
                multiple
                :rules="[(v) => v.length > 0 || 'Device is required!']"
                required
              ></v-select>

              <v-text-field
                v-model="program_name"
                :rules="[(v) => !!v || 'Program name is required!']"
                label="Program name"
                required
              ></v-text-field>

              <v-menu
                v-model="menu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="publish_date"
                    label="Publish Date"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="publish_date"
                  @input="menu = false"
                ></v-date-picker>
              </v-menu>

              <div>Select Layout</div>
              <v-radio-group v-model="layout" row mandatory>
                <v-radio value="layout1">
                  <template v-slot:label>
                    <div>
                      <v-img
                        height="100"
                        width="100"
                        :src="require(`@/assets/layout1.png`)"
                        contain
                      ></v-img>
                    </div>
                  </template>
                </v-radio>
                <v-radio value="layout2">
                  <template v-slot:label>
                    <div>
                      <v-img
                        height="100"
                        width="100"
                        :src="require(`@/assets/layout2.png`)"
                        contain
                      ></v-img>
                    </div>
                  </template>
                </v-radio>
              </v-radio-group>

              <v-textarea
                v-if="layout === 'layout1'"
                outlined
                name="input-7-4"
                label="Scroll(bottom to top) notice"
                v-model="notice"
                :rules="[(v) => !!v || 'notice is required!']"
              ></v-textarea>

              <v-textarea
                v-if="layout === 'layout1' || layout === 'layout2'"
                outlined
                name="input-7-4"
                label="Scroll(right to left) notice"
                v-model="marquee"
                :rules="[(v) => !!v || 'notice is required!']"
              ></v-textarea>
            </v-form>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="createProgram" :disabled="!valid"
              >Create</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="programs"
      :search="search"
      :loading="loading"
      loading-text="Loading... Please wait"
      single-expand
      show-expand
      item-key="program_id"
    >
      <template v-slot:[`item.date`]="{ item }">
        <div>
          {{ new Date(item.publish_date).toISOString().substring(0, 10) }}
        </div>
      </template>
      <template v-slot:[`item.update`]="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
      </template>
      <template v-slot:[`item.delete`]="{ item }">
        <v-dialog v-model="warning" width="500">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="red lighten-2" dark v-bind="attrs" v-on="on" icon>
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </template>

          <v-card>
            <v-card-title class="text-h5 red lighten-2">
              Warning!
              <v-spacer></v-spacer>
              <v-btn icon dark @click="warning = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>

            <v-card-text class="mt-5"> Are you sure? </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red" text @click="deleteProgram(item)">
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length" class="pa-5">
          <div>Associated Device:</div>

          <ul>
            <li v-for="(device, index) in item.devices" :key="index">
              {{ device.url }}
            </li>
          </ul>

          <div v-if="item.marquee">
            <div><strong>Scroll notice(Right to Left)</strong></div>
            {{ item.marquee }}
          </div>

          <div v-if="item.notice">
            <div><strong>Scroll notice(Bottom to Top)</strong></div>
            {{ item.notice }}
          </div>
        </td>
      </template>
    </v-data-table>

    <v-dialog v-model="edit_dialog" width="650">
      <v-card>
        <v-card-title class="text-h5 primary white--text" dark>
          Edit Program
          <v-spacer></v-spacer>
          <v-btn icon dark @click="edit_dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-menu
              v-model="menu1"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="publish_date"
                  label="Publish Date"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="publish_date"
                @input="menu1 = false"
              ></v-date-picker>
            </v-menu>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="saveEdit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar">
      {{ text }}

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
      snackbar: false,
      text: "",
      dialog: false,
      edit_dialog: false,
      warning: false,
      menu: false,
      menu1: false,
      search: "",
      headers: [
        {
          text: "Program name",
          align: "start",
          sortable: false,
          value: "program_name",
        },
        { text: "Publih Date", value: "date" },
        { text: "Layout", value: "layout" },
        {
          text: "Update Publish Date",
          align: "center",
          value: "update",
          sortable: false,
        },
        {
          text: "Delete",
          align: "center",
          value: "delete",
          sortable: false,
        },
        { text: "", value: "data-table-expand" },
      ],
      programs: [],

      program_name: "",
      publish_date: new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10),
      layout: "",
      selected_devices: [],
      devices: "",
      marquee: "",
      notice: "",

      editId: "",
    };
  },
  methods: {
    getDevices() {
      this.$axios
        .get("devices")
        .then((response) => {
          const { devices } = response.data;
          this.devices = devices;
        })
        .catch((err) => {
          console.error(err);
        });
    },
    getPrograms() {
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
    async createProgram() {
      this.dialog = false;

      // Create payload
      let new_program = {
        program_name: this.program_name,
        publish_date: this.publish_date,
        layout: this.layout,
        selected_devices: this.selected_devices,
        marquee: this.marquee,
        notice: this.notice,
      };

      // Make API call to create new program
      this.$axios
        .post("programs", new_program)
        .then((response) => {
          this.programs.unshift(response.data.new_program);
          // Reset form
          this.$refs.form.reset();
          this.text = response.data.message;
          this.snackbar = true;
        })
        .catch((err) => {
          this.text = err.response.data.message || "Something went wrong!";
          this.snackbar = true;
        });
    },
    editItem(item) {
      this.publish_date = new Date(item.publish_date)
        .toISOString()
        .substring(0, 10);
      this.editId = item.program_id;
      this.edit_dialog = true;
    },
    saveEdit() {
      // make api call to change
      this.$axios
        .put(`programs/${this.editId}`, { publish_date: this.publish_date })
        .then((response) => {
          let index = this.programs.findIndex(
            (element) => element.program_id === this.editId
          );
          this.programs[index].publish_date = this.publish_date;
          this.edit_dialog = false;
          // Reset form
          this.$refs.form.reset();
          this.text = response.data.message;
          this.snackbar = true;
        })
        .catch((err) => {
          this.text = err.response.data.message || "Something went wrong!";
          this.snackbar = true;
        });
    },
    deleteProgram(program) {
      this.$axios
        .delete(`programs/${program.program_id}/`)
        .then((response) => {
          this.programs = this.programs.filter(
            (item) => item.program_id != program.program_id
          );
          this.warning = false;
          this.text = response.data.message;
          this.snackbar = true;
        })
        .catch((err) => {
          this.text = err.response.data.message;
          this.snackbar = true;
        });
    },
  },
  created() {
    // Make API call to fetch all devices
    this.getDevices();

    // API call to fetch all programs
    this.getPrograms();
  },
};
</script>