import { setupLayouts } from "virtual:generated-layouts";
import { createRouter, createWebHistory } from "vue-router";

import Hero from "@/pages/index.vue";
import Auth from "@/pages/Auth.vue";
import Dashboard from "@/pages/HomeView.vue";
import NotFound from "@/pages/NotFound.vue";
import ForbiddenView from "@/pages/ForbiddenView.vue";
import AdminUserRolesView from "@/pages/admin/AdminUserRolesView.vue";
import UserManagementView from "@/pages/admin/UserManagementView.vue";
import ReportManagementView from "@/pages/ReportManagementView.vue";
import MyReportsView from "@/pages/MyReportsView.vue";
import ReportIssueView from "@/pages/ReportIssueView.vue";
import ProfileSettingsView from "@/pages/ProfileSettingsView.vue";

/**
 * Route definitions for the application
 */
const routes = setupLayouts([
  {
    path: "/",
    component: Hero,
  },
  {
    path: "/auth",
    component: Auth,
  },

  {
    path: "/account/home",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/account/profile-settings",
    component: ProfileSettingsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/user-roles",
    component: AdminUserRolesView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/user-management",
    component: UserManagementView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/report-management",
    component: ReportManagementView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/student/my-reports",
    component: MyReportsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/student/report-issue",
    component: ReportIssueView,
    meta: { requiresAuth: true },
  },
  {
    path: "/forbidden",
    component: ForbiddenView,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
]);

/**
 * Create and configure the router instance
 */
export const createAppRouter = () => {
  return createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
  });
};
