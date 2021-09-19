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
            New Device
            <v-spacer></v-spacer>
            <v-btn icon dark @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-form ref="form" v-model="valid">
              <v-text-field
                v-model="ip"
                :rules="[(v) => !!v || 'IP is required!']"
                label="IP"
                required
              ></v-text-field>

              <v-text-field
                v-model="device_name"
                :rules="[(v) => !!v || 'Device name is required!']"
                label="Device Name"
                required
              ></v-text-field>

              <v-text-field
                v-model="url"
                :rules="[(v) => !!v || 'URL is required!']"
                label="URL"
                required
              ></v-text-field>

              <v-text-field
                v-model="description"
                label="Description"
              ></v-text-field>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="createDevice" :disabled="!valid"
              >Create</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="devices"
      :search="search"
      :loading="loading"
      single-expand
      show-expand
      item-key="device_id"
      loading-text="Loading... Please wait"
    >
      <template v-slot:[`item.update`]="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
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
              <v-btn color="red" text @click="deleteDevice(item)">
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
          class="ma-2"
          outlined
          color="primary"
          dark
          small
          @click="activeInactive(item.device_id)"
        >
          {{ item.status ? "Make Inactive" : "Make Active" }}
        </v-btn>
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length" class="pa-5">
          {{ item.description }}
        </td>
      </template>
    </v-data-table>

    <v-dialog v-model="edit_dialog" width="500">
      <v-card>
        <v-card-title class="text-h5 primary white--text" dark>
          Update Device
          <v-spacer></v-spacer>
          <v-btn icon dark @click="edit_dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="editDevice.ip"
              :rules="[(v) => !!v || 'IP is required!']"
              label="IP"
              required
            ></v-text-field>

            <v-text-field
              v-model="editDevice.device_name"
              :rules="[(v) => !!v || 'Device name is required!']"
              label="Device Name"
              required
            ></v-text-field>

            <v-text-field
              v-model="editDevice.url"
              :rules="[(v) => !!v || 'URL is required!']"
              label="URL"
              required
            ></v-text-field>

            <v-text-field
              v-model="editDevice.description"
              label="Description"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="updateDevice" :disabled="!valid"
            >Save</v-btn
          >
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
      dialog: false,
      edit_dialog: false,
      warning: false,
      snackbar: false,
      text: "",
      search: "",
      headers: [
        {
          text: "IP",
          align: "start",
          sortable: false,
          value: "ip",
        },
        { text: "Device Name", value: "device_name" },
        { text: "Device Url", value: "url" },
        { text: "Update/Delete", value: "update", sortable: false },
        { text: "Actions", value: "actions", sortable: false, align: "center" },
        { text: "", value: "data-table-expand" },
      ],
      devices: [],
      expanded: [],

      ip: "",
      device_name: "",
      url: "",
      description: "",

      editDevice: {},
    };
  },
  methods: {
    createDevice() {
      // Create payload
      let new_device = {
        ip: this.ip,
        device_name: this.device_name,
        url: this.url,
        description: this.description,
      };

      // Make API call to create new device
      this.$axios
        .post("/devices", new_device)
        .then((response) => {
          this.devices.unshift(response.data.new_device);
          // Reset form
          this.$refs.form.reset();
          this.dialog = false;
        })
        .catch((err) => {
          this.text = err.response.data.message || "Something went wrong!";
          this.snackbar = true;
        });
    },
    activeInactive(id) {
      // find the index
      let index = this.devices.findIndex((element) => element.device_id == id);
      let status = this.devices[index].status;
      // make api call
      this.$axios
        .put(`devices/${id}/status`, { status: !status })
        .then((response) => {
          this.devices[index].status = !status;
          this.text = response.data.message;
          this.snackbar = true;
        })
        .catch((err) => {
          this.text = err.response.data.message;
          this.snackbar = true;
        });
    },
    editItem(item) {
      this.editDevice = Object.assign({}, item);
      this.edit_dialog = true;
    },
    updateDevice() {
      this.$axios
        .put(`devices/${this.editDevice.device_id}`, this.editDevice)
        .then((response) => {
          // Make api call to update
          let index = this.devices.findIndex(
            (element) => element.device_id == this.editDevice.device_id
          );

          Object.assign(this.devices[index], this.editDevice);
          this.editDevice = {};
          this.edit_dialog = false;

          // set snackbar
          this.text = response.data.message;
          this.snackbar = true;
        })
        .catch((err) => {
          // set snackbar
          this.text = err.response.data.message;
          this.snackbar = true;
        });
    },
    deleteDevice(device) {
      this.$axios
        .delete(`devices/${device.device_id}/`)
        .then((response) => {
          this.devices = this.devices.filter(
            (item) => item.device_id != device.device_id
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
    this.$axios
      .get("devices")
      .then((response) => {
        const { devices } = response.data;
        this.loading = false;
        this.devices = devices;
      })
      .catch((err) => {
        console.error(err);
      });
  },
};
</script>