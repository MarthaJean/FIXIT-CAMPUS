<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useAuthUserStore } from "@/stores/authUser";
import type { UserData } from "@/stores/authUser";
import { useUserRolesStore } from "@/stores/roles";
import { useToast } from "vue-toastification";
import DeleteUserDialog from "@/pages/admin/components/dialogs/DeleteUserDialog.vue";
import EditUserDialog from "@/pages/admin/components/dialogs/EditUserDialog.vue";
import UserDetailsDialog from "@/pages/admin/components/dialogs/UserDetailsDialog.vue";

import {
  formatDate,
  getErrorMessage,
  getRoleTitle,
  getRoleColor,
} from "@/utils/helpers";

// Composables
const authStore = useAuthUserStore();
const rolesStore = useUserRolesStore();
const toast = useToast();

// Reactive data
const loading = ref(false);
const search = ref("");
const userDialog = ref(false);
const editDialog = ref(false);
const selectedUser = ref<UserData | null>(null);
const editingUser = ref<UserData | null>(null);
const deleteDialog = ref(false);
const userToDelete = ref<UserData | null>(null);

// Computed
const filteredUsers = computed(() => {
  if (!search.value) return authStore.users;

  const query = search.value.toLowerCase();
  return authStore.users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      getRoleTitle(user.role_id, rolesStore.roles).toLowerCase().includes(query)
  );
});

// Methods
const fetchUsers = async () => {
  loading.value = true;
  try {
    const result = await authStore.getAllUsers();

    if (result.error) {
      toast.error("Failed to fetch users: " + getErrorMessage(result.error));
      console.error("Error fetching users:", result.error);
      return;
    }

    // Users are now stored in authStore.users reactively
    if (result.users) {
      // toast.success(`Loaded ${result.users.length} users`)
    }
  } catch (error) {
    toast.error("An unexpected error occurred while fetching users");
    console.error("Unexpected error:", error);
  } finally {
    loading.value = false;
  }
};
const viewUser = (user: UserData) => {
  selectedUser.value = user;
  userDialog.value = true;
};
const editUser = (user: UserData) => {
  editingUser.value = user;
  editDialog.value = true;
};

const deleteUser = (user: UserData) => {
  userToDelete.value = user;
  deleteDialog.value = true;
};

// Event handlers
const onUserUpdated = (updatedUser: UserData) => {
  // The store already updates the users array automatically
  console.log("User updated:", updatedUser);
};

const onUserDeleted = (deletedUserId: string) => {
  // The store already removes the user from the users array automatically
  console.log("User deleted:", deletedUserId);
};

// Lifecycle
onMounted(async () => {
  await rolesStore.fetchRoles();
  await fetchUsers();
});
</script>

<template>
  <v-card-title class="d-flex justify-space-between align-center">
    <div>
      <h3 class="outfit-title">User Management</h3>
      <p class="text-subtitle-1 text-grey joss">Manage all system users</p>
    </div>
    <!--  <v-btn
        color="primary"
        prepend-icon="mdi-refresh"
        @click="refreshData"
        :loading="loading"
      >
        Refresh
      </v-btn> -->
  </v-card-title>

  <v-card-text>
    <!-- Search Bar -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search users..."
          placeholder="Search by name, email, or role..."
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
        />
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col cols="12" class="text-center py-12">
        <img
          src="@/assets/loading.gif"
          alt="Loading..."
          style="width: 200px; height: auto"
        />
        <p class="text-body-1 mt-4 joss">Loading users...</p>
      </v-col>
    </v-row>

    <!-- No Data State -->
    <v-row v-else-if="filteredUsers.length === 0">
      <v-col cols="12">
        <v-card class="text-center py-12" variant="outlined">
          <v-icon size="64" color="grey">mdi-account-off</v-icon>
          <p class="text-h6 mt-4 outfit-title">No users found</p>
          <p class="text-body-2 text-grey joss">
            {{
              search
                ? "No users match your search criteria."
                : "There are no users in the system yet."
            }}
          </p>
        </v-card>
      </v-col>
    </v-row>

    <!-- User Cards -->
    <v-row v-else>
      <v-col
        v-for="user in filteredUsers"
        :key="user.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="h-100" hover>
          <!-- Card Header with Avatar -->
          <v-card-title class="d-flex align-center pa-4">
            <v-avatar color="primary" class="mr-3">
              <span class="text-h6">{{
                user.full_name?.charAt(0).toUpperCase() || "U"
              }}</span>
            </v-avatar>
            <div class="flex-grow-1">
              <div class="text-h6 outfit-title">
                {{ user.full_name || "No Name" }}
              </div>
              <div class="text-caption text-medium-emphasis joss">
                {{ user.email }}
              </div>
            </div>
          </v-card-title>

          <v-divider />

          <!-- Card Content -->
          <v-card-text class="pb-2">
            <div class="d-flex flex-column gap-3">
              <!-- Role -->
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon icon="mdi-shield-account" size="small" class="mr-2" />
                  <span class="text-caption joss">Role:</span>
                </div>
                <v-chip
                  :color="getRoleColor(user.role_id)"
                  variant="tonal"
                  size="small"
                  class="joss"
                >
                  {{ getRoleTitle(user.role_id, rolesStore.roles) }}
                </v-chip>
              </div>

              <!-- Created At -->
              <div class="d-flex align-center">
                <v-icon icon="mdi-clock-outline" size="small" class="mr-2" />
                <span class="text-caption joss">
                  Joined {{ formatDate(user.created_at) }}
                </span>
              </div>
            </div>
          </v-card-text>

          <v-divider />

          <!-- Card Actions -->
          <v-card-actions class="px-4 py-3">
            <v-btn
              variant="tonal"
              size="small"
              prepend-icon="mdi-eye"
              @click="viewUser(user)"
            >
              View
            </v-btn>
            <v-spacer />
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              color="primary"
              @click="editUser(user)"
            >
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top">Edit</v-tooltip>
            </v-btn>
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="deleteUser(user)"
            >
              <v-icon>mdi-delete</v-icon>
              <v-tooltip activator="parent" location="top">Delete</v-tooltip>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-card-text>

  <!-- User Details Dialog -->
  <UserDetailsDialog v-model="userDialog" :user="selectedUser" />

  <!-- Edit User Dialog -->
  <EditUserDialog
    v-model="editDialog"
    :user="editingUser"
    @user-updated="onUserUpdated"
  />

  <!-- Delete User Dialog -->
  <DeleteUserDialog
    v-model="deleteDialog"
    :user="userToDelete"
    @user-deleted="onUserDeleted"
  />
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap");

.outfit-title {
  font-family: "Outfit", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
}

.joss {
  font-family: "Jost", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
}
.v-card-title h3 {
  margin-bottom: 4px;
}

.h-100 {
  height: 100%;
}

.gap-3 {
  gap: 12px;
}
</style>
