<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useReportsStore, type Report } from "@/stores/reportsData";
import { useToast } from "vue-toastification";
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";

const reportsStore = useReportsStore();
const toast = useToast();

// Local state
const searchQuery = ref("");
const selectedReport = ref<Report | null>(null);
const isDetailsDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const statusFilter = ref<string>("all");

// Computed
const filteredReports = computed(() => {
  let filtered = reportsStore.reports;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (report) =>
        report.title.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query) ||
        report.id.toString().includes(query)
    );
  }

  return filtered;
});

const totalReports = computed(() => filteredReports.value.length);

// Actions
const openDetailsDialog = (report: Report) => {
  selectedReport.value = report;
  isDetailsDialogOpen.value = true;
};

const openDeleteDialog = (report: Report) => {
  selectedReport.value = report;
  isDeleteDialogOpen.value = true;
};

const closeDialogs = () => {
  isDetailsDialogOpen.value = false;
  isDeleteDialogOpen.value = false;
  selectedReport.value = null;
};

const handleDelete = async () => {
  if (!selectedReport.value) return;

  try {
    await reportsStore.deleteReport(selectedReport.value.id);
    toast.success("Report deleted successfully");
    closeDialogs();
  } catch (error) {
    toast.error("Failed to delete report");
    console.error("Delete error:", error);
  }
};

const refreshReports = async () => {
  try {
    await reportsStore.fetchReports();
    toast.success("Reports refreshed");
  } catch (error) {
    toast.error("Failed to refresh reports");
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Load reports on mount
onMounted(() => {
  reportsStore.fetchReports();
});
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid class="pa-6">
        <!-- Header -->
        <v-row class="mb-4">
          <v-col cols="12">
            <div class="d-flex justify-space-between align-center">
              <div>
                <h1 class="text-h4 font-weight-bold mb-2">Report Management</h1>
                <p class="text-subtitle-1 text-medium-emphasis">
                  View and manage classroom & facility issue reports
                </p>
              </div>
              <v-btn
                color="primary"
                prepend-icon="mdi-refresh"
                @click="refreshReports"
                :loading="reportsStore.loading"
              >
                Refresh
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Stats Cards -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-card>
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-file-document-multiple"
                    size="40"
                    color="primary"
                    class="mr-3"
                  />
                  <div>
                    <div class="text-h5 font-weight-bold">
                      {{ totalReports }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Total Reports
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Search and Filters -->
        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Search reports"
              placeholder="Search by title, description, or ID..."
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            />
          </v-col>
        </v-row>

        <!-- Reports Cards -->
        <v-row v-if="reportsStore.loading" class="mb-4">
          <v-col cols="12" class="text-center py-12">
            <v-progress-circular indeterminate color="primary" size="64" />
            <p class="text-body-1 mt-4">Loading reports...</p>
          </v-col>
        </v-row>

        <v-row v-else-if="filteredReports.length === 0" class="mb-4">
          <v-col cols="12">
            <v-card class="text-center py-12">
              <v-icon
                icon="mdi-file-document-alert-outline"
                size="64"
                color="grey"
              />
              <p class="text-h6 mt-4">No reports found</p>
              <p class="text-body-2 text-medium-emphasis">
                There are no reports matching your criteria
              </p>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col
            v-for="report in filteredReports"
            :key="report.id"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card class="h-100" hover>
              <!-- Image Section -->
              <v-img
                v-if="report.image_url"
                :src="report.image_url"
                height="200"
                cover
                class="align-end"
              >
                <v-chip
                  class="ma-2"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-identifier"
                >
                  ID: {{ report.id }}
                </v-chip>
              </v-img>
              <div v-else class="bg-grey-lighten-3 pa-4" style="height: 200px">
                <div class="d-flex align-center justify-center h-100">
                  <div class="text-center">
                    <v-icon
                      icon="mdi-image-off-outline"
                      size="64"
                      color="grey"
                    />
                    <p class="text-caption text-medium-emphasis mt-2">
                      No image attached
                    </p>
                  </div>
                </div>
                <v-chip
                  class="position-absolute ma-2"
                  style="top: 0; left: 0"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-identifier"
                >
                  ID: {{ report.id }}
                </v-chip>
              </div>

              <!-- Card Content -->
              <v-card-title class="text-h6">
                {{ report.title }}
              </v-card-title>

              <v-card-text>
                <!-- Description -->
                <p class="text-body-2 mb-3 text-truncate-2">
                  {{ report.description }}
                </p>

                <!-- Meta Information -->
                <div class="d-flex flex-column gap-2">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-door" size="small" class="mr-2" />
                    <span class="text-caption">Classroom:</span>
                    <v-chip class="ml-2" color="primary" size="x-small">
                      {{ report.classroom_id }}
                    </v-chip>
                  </div>

                  <div class="d-flex align-center">
                    <v-icon icon="mdi-account" size="small" class="mr-2" />
                    <span class="text-caption">Submitted by:</span>
                    <v-chip class="ml-2" color="info" size="x-small">
                      {{ report.user_id.substring(0, 8) }}...
                    </v-chip>
                  </div>

                  <div class="d-flex align-center">
                    <v-icon
                      icon="mdi-clock-outline"
                      size="small"
                      class="mr-2"
                    />
                    <span class="text-caption">
                      {{ formatDate(report.created_at) }}
                    </span>
                  </div>
                </div>
              </v-card-text>

              <!-- Card Actions -->
              <v-card-actions class="px-4 pb-4">
                <v-btn
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-eye"
                  @click="openDetailsDialog(report)"
                  block
                >
                  View Details
                </v-btn>
              </v-card-actions>

              <v-divider />

              <v-card-actions class="px-4 pb-4">
                <v-spacer />
                <v-btn
                  color="error"
                  variant="text"
                  prepend-icon="mdi-delete"
                  @click="openDeleteDialog(report)"
                >
                  Delete
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Details Dialog -->
      <v-dialog v-model="isDetailsDialogOpen" max-width="700">
        <v-card v-if="selectedReport">
          <v-card-title
            class="d-flex justify-space-between align-center bg-primary"
          >
            <span class="text-h5">Report Details</span>
            <v-btn icon variant="text" @click="closeDialogs">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text class="pt-6">
            <v-row>
              <v-col cols="12">
                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis mb-1">
                    Report ID
                  </div>
                  <div class="text-body-1">{{ selectedReport.id }}</div>
                </div>
              </v-col>

              <v-col cols="12">
                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis mb-1">
                    Title
                  </div>
                  <div class="text-h6">{{ selectedReport.title }}</div>
                </div>
              </v-col>

              <v-col cols="12">
                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis mb-1">
                    Description
                  </div>
                  <div class="text-body-1">
                    {{ selectedReport.description }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis mb-1">
                    Classroom ID
                  </div>
                  <v-chip color="primary" size="small">{{
                    selectedReport.classroom_id
                  }}</v-chip>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis mb-1">
                    Submitted By
                  </div>
                  <v-chip color="info" size="small">{{
                    selectedReport.user_id
                  }}</v-chip>
                </div>
              </v-col>

              <v-col cols="12">
                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis mb-1">
                    Submitted At
                  </div>
                  <div class="text-body-1">
                    {{ formatDate(selectedReport.created_at) }}
                  </div>
                </div>
              </v-col>

              <v-col v-if="selectedReport.image_url" cols="12">
                <div class="mb-4">
                  <div class="text-caption text-medium-emphasis mb-2">
                    Attached Image
                  </div>
                  <v-img
                    :src="selectedReport.image_url"
                    max-height="400"
                    class="rounded"
                    cover
                  />
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="px-6 pb-4">
            <v-spacer />
            <v-btn color="primary" variant="text" @click="closeDialogs"
              >Close</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="isDeleteDialogOpen" max-width="500">
        <v-card>
          <v-card-title class="bg-error">
            <v-icon icon="mdi-alert" class="mr-2" />
            Confirm Delete
          </v-card-title>

          <v-card-text class="pt-6">
            <p class="text-body-1">
              Are you sure you want to delete this report?
            </p>
            <p
              v-if="selectedReport"
              class="text-body-2 text-medium-emphasis mt-2"
            >
              <strong>Title:</strong> {{ selectedReport.title }}
            </p>
            <p class="text-body-2 text-error mt-4">
              This action cannot be undone.
            </p>
          </v-card-text>

          <v-card-actions class="px-6 pb-4">
            <v-spacer />
            <v-btn color="grey" variant="text" @click="closeDialogs"
              >Cancel</v-btn
            >
            <v-btn
              color="error"
              variant="flat"
              @click="handleDelete"
              :loading="reportsStore.loading"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped>
.v-card-title {
  color: white;
}
</style>
