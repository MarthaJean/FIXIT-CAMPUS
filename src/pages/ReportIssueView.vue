<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useReportsStore } from "@/stores/reportsData";
import { useAuthUserStore } from "@/stores/authUser";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";

const reportsStore = useReportsStore();
const authStore = useAuthUserStore();
const router = useRouter();
const toast = useToast();

// Form state
const form = ref({
  title: "",
  description: "",
  classroom_id: null as number | null,
  image_url: "",
});

// Validation
const formValid = ref(false);
const titleRules = [
  (v: string) => !!v || "Title is required",
  (v: string) => v.length >= 5 || "Title must be at least 5 characters",
  (v: string) => v.length <= 100 || "Title must be less than 100 characters",
];

const descriptionRules = [
  (v: string) => !!v || "Description is required",
  (v: string) => v.length >= 10 || "Description must be at least 10 characters",
  (v: string) =>
    v.length <= 1000 || "Description must be less than 1000 characters",
];

const classroomRules = [
  (v: number | null) => v !== null || "Classroom/Facility is required",
  (v: number | null) =>
    (v !== null && v > 0) || "Please select a valid classroom/facility",
];

// Mock classroom/facility options (you should fetch these from your database)
const classroomOptions = ref([
  { id: 1, name: "Classroom 101" },
  { id: 2, name: "Classroom 102" },
  { id: 3, name: "Classroom 103" },
  { id: 4, name: "Computer Lab 1" },
  { id: 5, name: "Computer Lab 2" },
  { id: 6, name: "Library" },
  { id: 7, name: "Gymnasium" },
  { id: 8, name: "Cafeteria" },
  { id: 9, name: "Auditorium" },
  { id: 10, name: "Restroom - Building A" },
]);

const loading = ref(false);

// Methods
const handleSubmit = async () => {
  if (!formValid.value || !authStore.userData?.id) return;

  if (form.value.classroom_id === null) {
    toast.error("Please select a classroom/facility");
    return;
  }

  loading.value = true;

  try {
    await reportsStore.createReport({
      title: form.value.title,
      description: form.value.description,
      classroom_id: form.value.classroom_id,
      user_id: authStore.userData.id,
      image_url: form.value.image_url || undefined,
      status: "Pending",
    });

    toast.success("Report submitted successfully!");
    resetForm();
    router.push("/student/my-reports");
  } catch (error) {
    toast.error("Failed to submit report. Please try again.");
    console.error("Submit error:", error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    title: "",
    description: "",
    classroom_id: null,
    image_url: "",
  };
  formValid.value = false;
};

const handleCancel = () => {
  resetForm();
  router.push("/account/home");
};
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid class="pa-6">
        <!-- Header -->
        <v-row class="mb-6">
          <v-col cols="12">
            <div class="d-flex align-center gap-3">
              <v-btn
                icon="mdi-arrow-left"
                variant="text"
                @click="handleCancel"
              />
              <div>
                <h1 class="text-h4 font-weight-bold mb-2 outfit-title">
                  Report an Issue
                </h1>
                <p class="text-subtitle-1 text-medium-emphasis joss">
                  Submit a new report about classroom or facility issues
                </p>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Report Form -->
        <v-row>
          <v-col cols="12" md="8" lg="6">
            <v-card elevation="2" class="pa-4">
              <v-card-title class="text-h5 outfit-title mb-4">
                Report Issue Form
              </v-card-title>

              <v-card-text>
                <v-form v-model="formValid" @submit.prevent="handleSubmit">
                  <!-- Title Field -->
                  <div class="mb-4">
                    <v-text-field
                      v-model="form.title"
                      label="Report Title *"
                      placeholder="e.g., Broken chair in Classroom 101"
                      variant="outlined"
                      :rules="titleRules"
                      counter="100"
                      required
                    />
                  </div>

                  <!-- Classroom/Facility Selector -->
                  <div class="mb-4">
                    <v-select
                      v-model="form.classroom_id"
                      :items="classroomOptions"
                      item-title="name"
                      item-value="id"
                      label="Select Classroom/Facility *"
                      placeholder="Choose the location"
                      variant="outlined"
                      :rules="classroomRules"
                      required
                    >
                      <template v-slot:prepend-inner>
                        <v-icon>mdi-map-marker</v-icon>
                      </template>
                    </v-select>
                  </div>

                  <!-- Description Field -->
                  <div class="mb-4">
                    <v-textarea
                      v-model="form.description"
                      label="Description *"
                      placeholder="Please provide detailed information about the issue..."
                      variant="outlined"
                      rows="6"
                      :rules="descriptionRules"
                      counter="1000"
                      required
                    />
                  </div>

                  <!-- Image URL Field (Optional) -->
                  <div class="mb-4">
                    <v-text-field
                      v-model="form.image_url"
                      label="Image URL (Optional)"
                      placeholder="https://example.com/image.jpg"
                      variant="outlined"
                      hint="Paste a URL to an image showing the issue"
                      persistent-hint
                    >
                      <template v-slot:prepend-inner>
                        <v-icon>mdi-image</v-icon>
                      </template>
                    </v-text-field>
                  </div>

                  <!-- Image Preview -->
                  <div v-if="form.image_url" class="mb-4">
                    <v-card variant="outlined">
                      <v-card-subtitle class="joss"
                        >Image Preview</v-card-subtitle
                      >
                      <v-card-text>
                        <v-img
                          :src="form.image_url"
                          max-height="300"
                          class="rounded"
                          @error="toast.error('Failed to load image')"
                        />
                      </v-card-text>
                    </v-card>
                  </div>

                  <!-- Info Alert -->
                  <v-alert
                    type="info"
                    variant="tonal"
                    class="mb-4"
                    icon="mdi-information"
                  >
                    <div class="joss">
                      <strong>Note:</strong> Your report will be reviewed by the
                      admin team. You can edit or delete your report while it's
                      in "Pending" status.
                    </div>
                  </v-alert>

                  <!-- Form Actions -->
                  <div class="d-flex gap-3 justify-end">
                    <v-btn
                      color="grey"
                      variant="outlined"
                      @click="handleCancel"
                      :disabled="loading"
                      size="large"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      color="primary"
                      variant="flat"
                      type="submit"
                      :disabled="!formValid"
                      :loading="loading"
                      size="large"
                      prepend-icon="mdi-send"
                    >
                      Submit Report
                    </v-btn>
                  </div>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Help Card -->
          <v-col cols="12" md="4" lg="6">
            <v-card elevation="2" color="primary" class="pa-4 text-white">
              <v-card-title class="text-h5 outfit-title mb-4">
                <v-icon class="mr-2" color="white">mdi-help-circle</v-icon>
                Reporting Guidelines
              </v-card-title>

              <v-card-text class="joss">
                <div class="mb-4">
                  <h3 class="text-h6 mb-2">What to Include</h3>
                  <ul class="ml-4">
                    <li class="mb-2">A clear, descriptive title</li>
                    <li class="mb-2">Specific location details</li>
                    <li class="mb-2">Detailed description of the issue</li>
                    <li class="mb-2">Photo evidence (if available)</li>
                  </ul>
                </div>

                <div class="mb-4">
                  <h3 class="text-h6 mb-2">Report Status</h3>
                  <ul class="ml-4">
                    <li class="mb-2">
                      <strong>Pending:</strong> Report submitted, awaiting
                      review
                    </li>
                    <li class="mb-2">
                      <strong>In Progress:</strong> Issue is being addressed
                    </li>
                    <li class="mb-2">
                      <strong>Resolved:</strong> Issue has been fixed
                    </li>
                    <li class="mb-2">
                      <strong>Rejected:</strong> Report was declined
                    </li>
                  </ul>
                </div>

                <v-divider class="my-4 opacity-50"></v-divider>

                <div class="text-caption">
                  <v-icon size="small" class="mr-1">mdi-alert-circle</v-icon>
                  For urgent or safety-related issues, please contact campus
                  security immediately.
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
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
</style>
