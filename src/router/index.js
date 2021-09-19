import Vue from "vue";
import VueRouter from "vue-router";
import DefaultLayout from "../layouts/DefaultLayout.vue";
import AdminLayout from "../layouts/AdminLayout.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/admin",
    name: "Admin",
    component: AdminLayout,
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "admin" */ "../views/Settings.vue"),
      },
      {
        path: 'devices',
        component: () => import(/* webpackChunkName: "settings" */ "../views/Devices.vue"),
      },
      {
        path: 'programs',
        component: () => import(/* webpackChunkName: "settings" */ "../views/Programs.vue"),
      },
      {
        path: 'contents',
        component: () => import(/* webpackChunkName: "settings" */ "../views/Contents.vue"),
      },
    ]
  },
  {
    path: "*",
    name: "HomePath",
    component: () => import(/* webpackChunkName: "HomePath" */ "../views/Home.vue"),
    meta: { layout: DefaultLayout }
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
