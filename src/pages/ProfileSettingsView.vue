<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthUserStore } from "@/stores/authUser";
import { useTheme } from "vuetify";
import { useToast } from "vue-toastification";
import { supabase } from "@/lib/supabase";
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";

const authStore = useAuthUserStore();
const theme = useTheme();
const toast = useToast();

// Sidebar menu items
const settingsMenu = [
  { title: "Account", icon: "mdi-account", active: true },
  { title: "Notifications", icon: "mdi-bell", active: false },
  { title: "Privacy", icon: "mdi-shield-lock", active: false },
  { title: "Languages", icon: "mdi-translate", active: false },
  { title: "Help", icon: "mdi-help-circle", active: false },
];

// Theme state
const isDarkMode = ref(theme.global.current.value.dark);

// Password change form
const showPasswordDialog = ref(false);
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Email change form
const showEmailDialog = ref(false);
const emailForm = ref({
  newEmail: "",
  password: "",
});
const showEmailPassword = ref(false);

// Name edit dialog
const showNameDialog = ref(false);
const nameForm = ref("");

// Loading states
const passwordLoading = ref(false);
const emailLoading = ref(false);

// Validation rules
const passwordRules = [
  (v: string) => !!v || "Password is required",
  (v: string) => v.length >= 6 || "Password must be at least 6 characters",
];

const emailRules = [
  (v: string) => !!v || "Email is required",
  (v: string) => /.+@.+\..+/.test(v) || "Email must be valid",
];

const confirmPasswordRule = [
  (v: string) => !!v || "Confirmation is required",
  (v: string) =>
    v === passwordForm.value.newPassword || "Passwords do not match",
];

// Methods
const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
  isDarkMode.value = theme.global.current.value.dark;
  localStorage.setItem("theme", theme.global.name.value);
  toast.success(`Switched to ${theme.global.name.value} mode`);
};

const openPasswordDialog = () => {
  showPasswordDialog.value = true;
  passwordForm.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
};

const closePasswordDialog = () => {
  showPasswordDialog.value = false;
  passwordForm.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
};

const handlePasswordChange = async () => {
  if (
    !passwordForm.value.currentPassword ||
    !passwordForm.value.newPassword ||
    !passwordForm.value.confirmPassword
  ) {
    toast.error("Please fill in all fields");
    return;
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  if (passwordForm.value.newPassword.length < 6) {
    toast.error("New password must be at least 6 characters");
    return;
  }

  passwordLoading.value = true;

  try {
    // First verify current password by trying to sign in
    const email = authStore.userEmail;
    if (!email) {
      throw new Error("User email not found");
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: passwordForm.value.currentPassword,
    });

    if (signInError) {
      toast.error("Current password is incorrect");
      return;
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordForm.value.newPassword,
    });

    if (updateError) throw updateError;

    toast.success("Password updated successfully");
    closePasswordDialog();
  } catch (error: any) {
    toast.error(error.message || "Failed to update password");
    console.error("Password update error:", error);
  } finally {
    passwordLoading.value = false;
  }
};

const openEmailDialog = () => {
  showEmailDialog.value = true;
  emailForm.value = {
    newEmail: "",
    password: "",
  };
};

const closeEmailDialog = () => {
  showEmailDialog.value = false;
  emailForm.value = {
    newEmail: "",
    password: "",
  };
};

const handleEmailChange = async () => {
  if (!emailForm.value.newEmail || !emailForm.value.password) {
    toast.error("Please fill in all fields");
    return;
  }

  if (!/.+@.+\..+/.test(emailForm.value.newEmail)) {
    toast.error("Please enter a valid email");
    return;
  }

  emailLoading.value = true;

  try {
    // Verify password first
    const currentEmail = authStore.userEmail;
    if (!currentEmail) {
      throw new Error("Current email not found");
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: emailForm.value.password,
    });

    if (signInError) {
      toast.error("Password is incorrect");
      return;
    }

    // Update email
    const { error: updateError } = await supabase.auth.updateUser({
      email: emailForm.value.newEmail,
    });

    if (updateError) throw updateError;

    toast.success(
      "Email update initiated. Please check your new email for confirmation."
    );
    closeEmailDialog();
  } catch (error: any) {
    toast.error(error.message || "Failed to update email");
    console.error("Email update error:", error);
  } finally {
    emailLoading.value = false;
  }
};

const handleLogout = async () => {
  await authStore.signOut();
  toast.success("Logged out successfully");
};

const openNameDialog = () => {
  nameForm.value = authStore.userName || "";
  showNameDialog.value = true;
};

const closeNameDialog = () => {
  showNameDialog.value = false;
};

// Load theme on mount
onMounted(() => {
  // Don't override theme on mount, just sync the isDarkMode ref
  isDarkMode.value = theme.global.current.value.dark;
});
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid class="settings-container pa-6">
        <v-row
          class="ma-0 justify-center align-center"
          style="min-height: 100vh"
        >
          <!-- Main Content -->
          <v-col cols="12" md="8" lg="7" xl="6" class="content-col pa-0">
            <div class="content-wrapper">
              <h1 class="page-title outfit-title mb-8 text-left">
                Profile Settings
              </h1>

              <!-- Basic Info Section -->
              <div class="info-section mb-6">
                <h3 class="section-title joss mb-4 text-left">
                  Account Details
                </h3>

                <!-- Name -->
                <div
                  class="info-item d-flex align-center justify-space-between py-4"
                  @click="openNameDialog"
                  style="cursor: pointer"
                >
                  <span class="item-label joss">Name</span>
                  <div class="d-flex align-center gap-2">
                    <span class="item-value joss">{{
                      authStore.userName || "N/A"
                    }}</span>
                  </div>
                </div>

                <v-divider class="my-2"></v-divider>

                <!-- User Id -->
                <div
                  class="info-item d-flex align-center justify-space-between py-4"
                >
                  <span class="joss">User ID</span>
                  <div class="d-flex align-center gap-2">
                    <span class="item-value joss">{{
                      authStore.userData?.id?.substring(0, 15) || "N/A"
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Account Info Section -->
              <div class="info-section">
                <h3 class="section-title joss mb-4 text-left">
                  Email and Pass
                </h3>

                <!-- Email -->
                <div
                  class="info-item d-flex align-center justify-space-between py-4"
                  @click="openEmailDialog"
                  style="cursor: pointer"
                >
                  <span class="item-label joss">Email</span>
                  <div class="d-flex align-center gap-2">
                    <span class="item-value joss">
                      {{ authStore.userEmail || "N/A" }}</span
                    >
                  </div>
                </div>

                <v-divider class="my-2"></v-divider>

                <!-- Password -->
                <div
                  class="info-item d-flex align-center justify-space-between py-4"
                  @click="openPasswordDialog"
                  style="cursor: pointer"
                >
                  <span class="item-label joss">Password</span>
                  <div class="d-flex align-center gap-2">
                    <span class="item-value joss">••••••••</span>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Name Edit Dialog -->
        <v-dialog v-model="showNameDialog" max-width="500">
          <v-card>
            <v-card-title class="text-h5 outfit-title">Edit Name</v-card-title>

            <v-card-text class="pt-4">
              <v-text-field
                v-model="nameForm"
                label="Full Name"
                variant="outlined"
                required
              />
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="grey" variant="text" @click="closeNameDialog">
                Cancel
              </v-btn>
              <v-btn color="primary" variant="flat" @click="closeNameDialog">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Change Password Dialog -->
        <v-dialog v-model="showPasswordDialog" max-width="500">
          <v-card>
            <v-card-title class="text-h5 outfit-title">
              Change Password
            </v-card-title>

            <v-card-text class="pt-4">
              <v-form @submit.prevent="handlePasswordChange">
                <v-text-field
                  v-model="passwordForm.currentPassword"
                  label="Current Password"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  :append-inner-icon="
                    showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'
                  "
                  @click:append-inner="
                    showCurrentPassword = !showCurrentPassword
                  "
                  variant="outlined"
                  :rules="passwordRules"
                  required
                  class="mb-3"
                />

                <v-text-field
                  v-model="passwordForm.newPassword"
                  label="New Password"
                  :type="showNewPassword ? 'text' : 'password'"
                  :append-inner-icon="
                    showNewPassword ? 'mdi-eye-off' : 'mdi-eye'
                  "
                  @click:append-inner="showNewPassword = !showNewPassword"
                  variant="outlined"
                  :rules="passwordRules"
                  required
                  class="mb-3"
                />

                <v-text-field
                  v-model="passwordForm.confirmPassword"
                  label="Confirm New Password"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :append-inner-icon="
                    showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'
                  "
                  @click:append-inner="
                    showConfirmPassword = !showConfirmPassword
                  "
                  variant="outlined"
                  :rules="confirmPasswordRule"
                  required
                />
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="grey"
                variant="text"
                @click="closePasswordDialog"
                :disabled="passwordLoading"
              >
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                @click="handlePasswordChange"
                :loading="passwordLoading"
              >
                Update Password
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Change Email Dialog -->
        <v-dialog v-model="showEmailDialog" max-width="500">
          <v-card>
            <v-card-title class="text-h5 outfit-title">
              Change Email
            </v-card-title>

            <v-card-text class="pt-4">
              <v-alert type="info" variant="tonal" class="mb-4 joss">
                You will need to confirm your new email address. A confirmation
                link will be sent to your new email.
              </v-alert>

              <v-form @submit.prevent="handleEmailChange">
                <v-text-field
                  v-model="emailForm.newEmail"
                  label="New Email"
                  type="email"
                  variant="outlined"
                  :rules="emailRules"
                  required
                  class="mb-3"
                />

                <v-text-field
                  v-model="emailForm.password"
                  label="Current Password"
                  :type="showEmailPassword ? 'text' : 'password'"
                  :append-inner-icon="
                    showEmailPassword ? 'mdi-eye-off' : 'mdi-eye'
                  "
                  @click:append-inner="showEmailPassword = !showEmailPassword"
                  variant="outlined"
                  :rules="passwordRules"
                  required
                />
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="grey"
                variant="text"
                @click="closeEmailDialog"
                :disabled="emailLoading"
              >
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                @click="handleEmailChange"
                :loading="emailLoading"
              >
                Update Email
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped>
/* Font imports */
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Jost:wght@100..900&display=swap");

/* Font classes */
.outfit-title {
  font-family: "Outfit", sans-serif;
}

.joss {
  font-family: "Jost", sans-serif;
}

/* Container */
.settings-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Sidebar */
.sidebar-col {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.settings-sidebar {
  padding: 48px 24px;
  height: 100%;
}

.sidebar-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.settings-list {
  padding: 0;
}

.settings-list-item {
  padding: 12px 16px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.settings-list-item:hover {
  background: rgba(233, 30, 99, 0.08);
}

.settings-list-item.active-item {
  background: rgba(233, 30, 99, 0.12);
  border-left: 4px solid #e91e63;
  padding-left: 12px;
}

.settings-list-item.active-item .v-list-item-title {
  color: #e91e63;
  font-weight: 600;
}

/* Content */
.content-col {
  background: transparent;
}

.content-wrapper {
  background: rgb(var(--v-theme-surface));
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 100%;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  text-align: left;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* Info Items */
.info-section {
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 16px;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-item {
  min-height: 60px;
  transition: background 0.2s ease;
}

.info-item:hover {
  background: rgba(var(--v-theme-primary), 0.08);
}

.item-label {
  font-size: 15px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-weight: 500;
}

.item-value {
  font-size: 15px;
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
}

/* Guide Note */
.guide-note {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(233, 30, 99, 0.05);
  border-radius: 12px;
}

/* Responsive */
@media (max-width: 960px) {
  .sidebar-col {
    display: none;
  }

  .content-wrapper {
    padding: 32px 24px;
    border-radius: 16px;
  }
}
</style>
