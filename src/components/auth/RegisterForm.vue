<template>
  <div class="register-form-wrapper">
    <!-- Header with Social Icons -->
    <div class="form-header">
      <h2 class="form-title">Register</h2>
    </div>

    <v-form ref="formRef" v-model="formValid" @submit.prevent="handleRegister">
      <v-container class="pa-0">
        <!-- Username Field -->
        <v-row no-gutters class="mb-3">
          <v-col cols="12">
            <label class="field-label">Username</label>
            <v-text-field
              v-model="registerForm.username"
              placeholder="Choose a username"
              variant="outlined"
              density="comfortable"
              :rules="[requiredValidator, usernameValidator]"
              :error-messages="errors.username"
              prepend-inner-icon="mdi-account-outline"
              class="custom-input"
              bg-color="#ffcce1"
              rounded="lg"
              hide-details="auto"
            />
          </v-col>
        </v-row>

        <!-- Email Field -->
        <v-row no-gutters class="mb-3">
          <v-col cols="12">
            <label class="field-label">Email</label>
            <v-text-field
              v-model="registerForm.email"
              placeholder="Enter your email"
              type="email"
              variant="outlined"
              density="comfortable"
              :rules="[requiredValidator, emailValidator]"
              :error-messages="errors.email"
              prepend-inner-icon="mdi-email-outline"
              class="custom-input"
              bg-color="#ffcce1"
              rounded="lg"
              hide-details="auto"
            />
          </v-col>
        </v-row>

        <!-- Role Field -->
        <v-row no-gutters class="mb-3">
          <v-col cols="12">
            <label class="field-label">Role</label>
            <v-select
              v-model="registerForm.role"
              placeholder="Select your role"
              variant="outlined"
              density="comfortable"
              :items="roleOptions"
              :rules="[requiredValidator]"
              :error-messages="errors.role"
              prepend-inner-icon="mdi-account-group-outline"
              class="custom-input"
              bg-color="#ffcce1"
              rounded="lg"
              hide-details="auto"
              :loading="rolesStore.loading"
              :disabled="rolesStore.loading"
            />
          </v-col>
        </v-row>

        <!-- Password Field -->
        <v-row no-gutters class="mb-3">
          <v-col cols="12">
            <label class="field-label">Password</label>
            <v-text-field
              v-model="registerForm.password"
              placeholder="Create a password"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              :rules="[requiredValidator, passwordValidator]"
              :error-messages="errors.password"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              class="custom-input"
              bg-color="#ffcce1"
              rounded="lg"
              hide-details="auto"
            />
          </v-col>
        </v-row>

        <!-- Confirm Password Field -->
        <v-row no-gutters class="mb-6">
          <v-col cols="12">
            <label class="field-label">Confirm Password</label>
            <v-text-field
              v-model="registerForm.confirmPassword"
              placeholder="Confirm your password"
              :type="showConfirmPassword ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              :rules="[
                  requiredValidator,
                  (v: string) => confirmedValidator(v, registerForm.password)
                ]"
              :error-messages="errors.confirmPassword"
              prepend-inner-icon="mdi-lock-check-outline"
              :append-inner-icon="
                showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'
              "
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
              class="custom-input"
              bg-color="#ffcce1 "
              rounded="lg"
              hide-details="auto"
            />
          </v-col>
        </v-row>

        <!-- Register Button -->
        <v-row no-gutters class="mb-4">
          <v-col cols="12">
            <v-btn
              type="submit"
              color="#EC7FA9"
              variant="flat"
              size="large"
              block
              :loading="isLoading"
              :disabled="!formValid || isLoading"
              class="register-btn"
              rounded="lg"
            >
              Create Account
            </v-btn>
          </v-col>
        </v-row>

        <!-- Sign In Link -->
        <v-row no-gutters>
          <v-col cols="12" class="text-center">
            <span class="signin-text">
              Already have an account?
              <a
                href="#"
                class="signin-link"
                @click.prevent="$emit('switch-to-login')"
              >
                Sign In
              </a>
            </span>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import {
  requiredValidator,
  emailValidator,
  passwordValidator,
  usernameValidator,
  confirmedValidator,
  getErrorMessage,
} from "@/lib/validator";
import { useAuthUserStore } from "@/stores/authUser";
import { useUserRolesStore } from "@/stores/roles";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";

// Emits
const emit = defineEmits<{
  "switch-to-login": [];
}>();

// Composables
const authStore = useAuthUserStore();
const rolesStore = useUserRolesStore();
const toast = useToast();
const router = useRouter();

// Form refs and reactive data
const formRef = ref();
const formValid = ref(false);
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Computed
const isLoading = computed(() => loading.value || authStore.loading);

// Form data
const registerForm = reactive({
  username: "",
  email: "",
  role: undefined as number | undefined,
  password: "",
  confirmPassword: "",
});

// Computed properties for role options
const roleOptions = computed(() => {
  return rolesStore.roles
    .filter((role) => role.id !== 2) // Exclude admin role
    .map((role) => ({
      title: role.title || "Untitled Role",
      value: role.id,
    }));
});

// Error handling
const errors = reactive({
  username: "",
  email: "",
  role: "",
  password: "",
  confirmPassword: "",
});

// Methods
const clearErrors = () => {
  errors.username = "";
  errors.email = "";
  errors.role = "";
  errors.password = "";
  errors.confirmPassword = "";
};

const handleRegister = async () => {
  if (!formValid.value) {
    toast.error("Please fill in all required fields correctly");
    return;
  }

  if (!registerForm.role) {
    toast.error("Please select a role");
    return;
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  loading.value = true;
  clearErrors();

  try {
    const result = await authStore.registerUser(
      registerForm.email,
      registerForm.password,
      registerForm.username,
      registerForm.role
    );

    if (result.error) {
      const errorMessage = getErrorMessage(result.error);
      toast.error(errorMessage || "Registration failed");

      // Handle specific error types
      if (errorMessage.toLowerCase().includes("email")) {
        errors.email = errorMessage;
      } else if (errorMessage.toLowerCase().includes("username")) {
        errors.username = errorMessage;
      } else if (errorMessage.toLowerCase().includes("password")) {
        errors.password = errorMessage;
      } else if (errorMessage.toLowerCase().includes("role")) {
        errors.role = errorMessage;
      }
    } else {
      toast.success(
        "Account created successfully! Please check your email to verify your account."
      );
      resetForm();
      // Switch back to login form after successful registration
      emit("switch-to-login");
    }
  } catch (error: any) {
    toast.error(error.message || "An unexpected error occurred");
  } finally {
    loading.value = false;
  }
};

// Reset form
const resetForm = () => {
  registerForm.username = "";
  registerForm.email = "";
  registerForm.role = undefined;
  registerForm.password = "";
  registerForm.confirmPassword = "";
  clearErrors();
  formRef.value?.resetValidation();
};

// Load roles on component mount
onMounted(async () => {
  await rolesStore.fetchRoles();
});

// Expose methods for parent component
defineExpose({
  resetForm,
});
</script>

<style scoped>
.register-form-wrapper {
  padding: 32px;
  background: linear-gradient(135deg, #ffe5ec 0%, #fff0f5 100%);
  border-radius: 12px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.field-label {
  display: block;
  font-size: 14px;
  color: #000000;
  margin-bottom: 8px;
  font-weight: 500;
}

.custom-input :deep(.v-field) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.custom-input :deep(.v-field__prepend-inner) {
  color: #000000;
}

.register-btn {
  text-transform: none;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0;
  color: white !important;
}

.signin-text {
  font-size: 14px;
  color: #666;
}

.signin-link {
  color: #e83c91;
  text-decoration: none;
  font-weight: 600;
}

.signin-link:hover {
  text-decoration: underline;
}
</style>
