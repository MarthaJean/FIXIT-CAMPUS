<template>
  <div class="login-form-wrapper">
    <!-- Header with Social Icons -->
    <div class="form-header">
      <h2 class="form-title">Sign in</h2>
    </div>

    <v-form ref="formRef" v-model="formValid" @submit.prevent="handleLogin">
      <v-container class="pa-0">
        <!-- Username/Email Field -->
        <v-row no-gutters class="mb-3">
          <v-col cols="12">
            <label class="field-label">Username</label>
            <v-text-field
              v-model="loginForm.email"
              placeholder="Enter your username or email"
              type="email"
              variant="outlined"
              density="comfortable"
              :rules="[requiredValidator, emailValidator]"
              :error-messages="errors.email"
              prepend-inner-icon="mdi-account-outline"
              class="custom-input"
              bg-color="#ffcce1"
              rounded="lg"
              hide-details="auto"
            />
          </v-col>
        </v-row>

        <!-- Password Field -->
        <v-row no-gutters class="mb-2">
          <v-col cols="12">
            <label class="field-label">Password</label>
            <v-text-field
              v-model="loginForm.password"
              placeholder="Enter your password"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              :rules="[requiredValidator]"
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

        <!-- Forgot Password -->
        <v-row no-gutters class="mb-6">
          <v-col cols="12" class="text-right">
            <a href="#" class="forgot-password-link">Forgot password</a>
          </v-col>
        </v-row>

        <!-- Sign In Button -->
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
              class="sign-in-btn"
              rounded="lg"
            >
              Sign in
            </v-btn>
          </v-col>
        </v-row>

        <!-- Register Link -->
        <v-row no-gutters>
          <v-col cols="12" class="text-center">
            <span class="register-text">
              Don't have an account?
              <a
                href="#"
                class="register-link"
                @click.prevent="$emit('switch-to-register')"
              >
                Register
              </a>
            </span>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import {
  requiredValidator,
  emailValidator,
  getErrorMessage,
} from "@/lib/validator";
import { useAuthUserStore } from "@/stores/authUser";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";

// Emits
defineEmits<{
  "switch-to-register": [];
}>();

// Composables
const authStore = useAuthUserStore();
const toast = useToast();
const router = useRouter();

// Form refs and reactive data
const formRef = ref();
const formValid = ref(false);
const loading = ref(false);
const showPassword = ref(false);

// Form data
const loginForm = reactive({
  email: "",
  password: "",
});

// Error handling
const errors = reactive({
  email: "",
  password: "",
});

// Computed
const isLoading = computed(() => loading.value || authStore.loading);
const passwordLabel = "Password";

// Methods
const clearErrors = () => {
  errors.email = "";
  errors.password = "";
};

const handleLogin = async () => {
  if (!formValid.value) {
    toast.error("Please fill in all required fields correctly");
    return;
  }

  loading.value = true;
  clearErrors();

  try {
    const result = await authStore.signIn(loginForm.email, loginForm.password);

    if (result.error) {
      const errorMessage = getErrorMessage(result.error);
      toast.error(errorMessage || "Login failed");

      // Handle specific error types
      if (errorMessage.toLowerCase().includes("email")) {
        errors.email = errorMessage;
      } else if (errorMessage.toLowerCase().includes("password")) {
        errors.password = errorMessage;
      }
    } else {
      toast.success("Login successful!");
      resetForm();
      router.push("/");
    }
  } catch (error: any) {
    toast.error(error.message || "An unexpected error occurred");
  } finally {
    loading.value = false;
  }
};

// Reset form
const resetForm = () => {
  loginForm.email = "";
  loginForm.password = "";
  clearErrors();
  formRef.value?.resetValidation();
};

// Expose methods for parent component
defineExpose({
  resetForm,
});
</script>

<style scoped>
.login-form-wrapper {
  padding: 32px;
  background: linear-gradient(135deg, #ffe5ec 0%, #fff0f5 100%);
  border-radius: 12px;
  min-height: 400px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
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
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.custom-input :deep(.v-field) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.custom-input :deep(.v-field__prepend-inner) {
  color: #999;
}

.forgot-password-link {
  font-size: 14px;
  color: #e83c91;
  text-decoration: none;
  font-weight: 500;
}

.forgot-password-link:hover {
  text-decoration: underline;
}

.sign-in-btn {
  text-transform: none;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0;
  color: white !important;
}

.register-text {
  font-size: 14px;
  color: #666;
}

.register-link {
  color: #e83c91;
  text-decoration: none;
  font-weight: 600;
}

.register-link:hover {
  text-decoration: underline;
}
</style>
