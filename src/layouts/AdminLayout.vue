<template>
  <v-app class="admin-layout">
    <v-navigation-drawer permanent app>
      <v-list dense nav>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          link
          :to="item.route"
          exact
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark> Floor Map </v-app-bar>

    <v-container fluid>
      <v-row class="fill-height">
        <v-col>
          <router-view></router-view>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: "AdminLayout",
  data() {
    return {
      items: [
        { title: "Settings", route: "/admin", icon: "mdi-cog" },

        {
          title: "Devices",
          route: "/admin/devices",
          icon: "mdi-cellphone-link",
        },
        {
          title: "Programs",
          route: "/admin/programs",
          icon: "mdi-progress-check",
        },
        {
          title: "Contents",
          route: "/admin/contents",
          icon: "mdi-content-save-move",
        },
      ],
      right: null,
    };
  },
};
</script>
