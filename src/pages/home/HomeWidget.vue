<script setup lang="ts">
import { ref } from "vue";
import { useReportsStore } from "@/stores/reportsData";
import { useAuthUserStore } from "@/stores/authUser";
import { useToast } from "vue-toastification";
import { supabase } from "@/lib/supabase";

const reportsStore = useReportsStore();
const authStore = useAuthUserStore();
const toast = useToast();

// Form data
const title = ref("");
const description = ref("");
const classroomId = ref<number>();
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

// Form state
const isSubmitting = ref(false);

// Handle image selection
const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    imageFile.value = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// Remove selected image
const removeImage = () => {
  imageFile.value = null;
  imagePreview.value = null;
};

// Upload image to Supabase Storage
const uploadImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Return the public URL
    const publicUrl = `https://tfowokcrwyisqowxobks.supabase.co/storage/v1/object/public/reports/${filePath}`;
    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

// Submit report
const submitReport = async () => {
  if (!title.value || !description.value || !classroomId.value) {
    toast.error("Please fill in all required fields");
    return;
  }

  isSubmitting.value = true;

  try {
    let imageUrl: string | undefined = undefined;

    // Upload image if one was selected
    if (imageFile.value) {
      toast.info("Uploading image...");
      imageUrl = (await uploadImage(imageFile.value)) || undefined;

      if (!imageUrl) {
        toast.warning(
          "Image upload failed, but continuing with report submission"
        );
      }
    }

    await reportsStore.createReport({
      title: title.value,
      description: description.value,
      classroom_id: classroomId.value,
      user_id: authStore.userData?.id,
      image_url: imageUrl,
    });

    toast.success("Report submitted successfully!");

    // Reset form
    title.value = "";
    description.value = "";
    classroomId.value = undefined;
    removeImage();
  } catch (error) {
    toast.error("Failed to submit report. Please try again.");
    console.error("Submit error:", error);
  } finally {
    isSubmitting.value = false;
  }
};

// Sample classrooms - you may want to fetch this from a classrooms store
const classrooms = ref([
  { id: 1, name: "Room 101 - Computer Lab" },
  { id: 2, name: "Room 102 - Science Lab" },
  { id: 3, name: "Room 103 - Library" },
  { id: 4, name: "Room 104 - Gymnasium" },
  { id: 5, name: "Room 105 - Cafeteria" },
]);
</script>

<template>
  <v-card class="mx-auto" max-width="800">
    <v-card-title class="text-h5 bg-primary joss">
      Report Issue Form
    </v-card-title>

    <v-card-text class="pt-6">
      <v-form @submit.prevent="submitReport">
        <!-- Title Input -->
        <v-text-field
          v-model="title"
          label="Report Title"
          placeholder="Brief description of the issue"
          variant="outlined"
          required
          :disabled="isSubmitting"
          class="mb-4"
        />

        <!-- Classroom Selection -->
        <v-select
          v-model="classroomId"
          :items="classrooms"
          item-title="name"
          item-value="id"
          label="Select Classroom/Facility"
          variant="outlined"
          required
          :disabled="isSubmitting"
          class="mb-4"
        />

        <!-- Description Textarea -->
        <v-textarea
          v-model="description"
          label="Description"
          placeholder="Provide detailed information about the problem..."
          variant="outlined"
          rows="5"
          required
          :disabled="isSubmitting"
          class="mb-4"
        />

        <!-- Image Upload -->
        <div class="mb-4">
          <v-file-input
            label="Upload Image (Optional)"
            prepend-icon="mdi-camera"
            variant="outlined"
            accept="image/*"
            :disabled="isSubmitting"
            @change="handleImageSelect"
          />

          <!-- Image Preview -->
          <v-card v-if="imagePreview" class="mt-2" variant="outlined">
            <v-card-text class="pa-2">
              <div class="d-flex align-center">
                <v-img
                  :src="imagePreview"
                  max-height="200"
                  max-width="200"
                  class="rounded"
                />
                <v-btn
                  icon="mdi-close"
                  size="small"
                  color="error"
                  class="ml-2"
                  @click="removeImage"
                />
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Submit Button -->
        <v-btn
          type="submit"
          color="primary"
          size="large"
          block
          :loading="isSubmitting"
          :disabled="isSubmitting"
        >
          Submit Report
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
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
.v-card-title {
  color: white;
}
</style>
