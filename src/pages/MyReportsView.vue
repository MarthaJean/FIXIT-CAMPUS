<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useReportsStore, type Report } from "@/stores/reportsData";
import { useAuthUserStore } from "@/stores/authUser";
import { useToast } from "vue-toastification";
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";

const reportsStore = useReportsStore();
const authStore = useAuthUserStore();
const toast = useToast();

// Local state
const searchQuery = ref("");
const selectedReport = ref<Report | null>(null);
const isDetailsDialogOpen = ref(false);
const isEditDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const statusFilter = ref<string>("all");

// Edit form
const editForm = ref({
  title: "",
  description: "",
  classroom_id: 0,
  image_url: "",
});

// Load user's reports
const userReports = ref<Report[]>([]);

// Computed
const filteredReports = computed(() => {
  let filtered = userReports.value;

  // Status filter
  if (statusFilter.value && statusFilter.value !== "all") {
    filtered = filtered.filter(
      (report) => report.status === statusFilter.value
    );
  }

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

const totalReports = computed(() => userReports.value.length);
const pendingReports = computed(
  () => userReports.value.filter((r) => r.status === "Pending").length
);
const resolvedReports = computed(
  () => userReports.value.filter((r) => r.status === "Resolved").length
);

// Check if report can be edited/deleted (only Pending status)
const canModifyReport = (report: Report) => {
  return report.status === "Pending";
};

// Actions
const openDetailsDialog = (report: Report) => {
  selectedReport.value = report;
  isDetailsDialogOpen.value = true;
};

const openEditDialog = (report: Report) => {
  if (!canModifyReport(report)) {
    toast.warning("You can only edit reports with Pending status");
    return;
  }
  selectedReport.value = report;
  editForm.value = {
    title: report.title,
    description: report.description,
    classroom_id: report.classroom_id,
    image_url: report.image_url || "",
  };
  isEditDialogOpen.value = true;
};

const openDeleteDialog = (report: Report) => {
  if (!canModifyReport(report)) {
    toast.warning("You can only delete reports with Pending status");
    return;
  }
  selectedReport.value = report;
  isDeleteDialogOpen.value = true;
};

const closeDialogs = () => {
  isDetailsDialogOpen.value = false;
  isEditDialogOpen.value = false;
  isDeleteDialogOpen.value = false;
  selectedReport.value = null;
};

const handleEdit = async () => {
  if (!selectedReport.value) return;

  try {
    await reportsStore.updateReport(selectedReport.value.id, {
      title: editForm.value.title,
      description: editForm.value.description,
      classroom_id: editForm.value.classroom_id,
      image_url: editForm.value.image_url,
    });
    toast.success("Report updated successfully");
    closeDialogs();
    await loadUserReports();
  } catch (error) {
    toast.error("Failed to update report");
    console.error("Update error:", error);
  }
};

const handleDelete = async () => {
  if (!selectedReport.value) return;

  try {
    await reportsStore.deleteReport(selectedReport.value.id);
    toast.success("Report deleted successfully");
    closeDialogs();
    await loadUserReports();
  } catch (error) {
    toast.error("Failed to delete report");
    console.error("Delete error:", error);
  }
};

const loadUserReports = async () => {
  if (!authStore.userData?.id) return;

  try {
    const reports = await reportsStore.fetchReportsByUser(
      authStore.userData.id
    );
    userReports.value = reports;
  } catch (error) {
    toast.error("Failed to load reports");
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

const getStatusColor = (status?: string) => {
  switch (status) {
    case "Pending":
      return "warning";
    case "In Progress":
      return "info";
    case "Resolved":
      return "success";
    case "Rejected":
      return "error";
    default:
      return "grey";
  }
};

// Load reports on mount
onMounted(() => {
  loadUserReports();
});
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid class="pa-6">
        <!-- Header -->
        <v-row class="mb-6">
          <v-col cols="12">
            <div
              class="d-flex justify-space-between align-center flex-wrap gap-3"
            >
              <div>
                <h1 class="text-h4 font-weight-bold mb-2 outfit-title">
                  My Reports
                </h1>
                <p class="text-subtitle-1 text-medium-emphasis joss">
                  View and manage your submitted reports
                </p>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Search and Filter Section -->
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
          <v-col cols="12" md="3">
            <v-select
              v-model="statusFilter"
              :items="[
                { title: 'All Status', value: 'all' },
                { title: 'Pending', value: 'Pending' },
                { title: 'In Progress', value: 'In Progress' },
                { title: 'Resolved', value: 'Resolved' },
                { title: 'Rejected', value: 'Rejected' },
              ]"
              label="Filter by Status"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3" class="d-flex justify-end align-center">
            <v-btn
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="loadUserReports"
              :loading="reportsStore.loading"
            >
              Refresh
            </v-btn>
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
                    <div class="text-h5 font-weight-bold outfit-title">
                      {{ totalReports }}
                    </div>
                    <div class="text-caption text-medium-emphasis joss">
                      Total Reports
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card>
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-clock-outline"
                    size="40"
                    color="warning"
                    class="mr-3"
                  />
                  <div>
                    <div class="text-h5 font-weight-bold outfit-title">
                      {{ pendingReports }}
                    </div>
                    <div class="text-caption text-medium-emphasis joss">
                      Pending
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card>
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-check-circle"
                    size="40"
                    color="success"
                    class="mr-3"
                  />
                  <div>
                    <div class="text-h5 font-weight-bold outfit-title">
                      {{ resolvedReports }}
                    </div>
                    <div class="text-caption text-medium-emphasis joss">
                      Resolved
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Reports Cards -->
        <v-row v-if="reportsStore.loading" class="mb-4">
          <v-col cols="12" class="text-center py-12">
            <img
              src="@/assets/loading.gif"
              alt="Loading..."
              style="width: 200px; height: auto"
            />
            <p class="text-body-1 mt-4 joss">Loading reports...</p>
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
              <p class="text-h6 mt-4 outfit-title">No reports found</p>
              <p class="text-body-2 text-medium-emphasis joss">
                You haven't submitted any reports yet
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
            <v-card class="report-card" elevation="2">
              <v-card-title class="d-flex justify-space-between align-center">
                <span class="text-h6 outfit-title">{{ report.title }}</span>
                <v-chip
                  :color="getStatusColor(report.status)"
                  size="small"
                  class="joss"
                >
                  {{ report.status || "Pending" }}
                </v-chip>
              </v-card-title>

              <v-card-subtitle class="joss">
                Report #{{ report.id }}
              </v-card-subtitle>

              <v-card-text>
                <p class="text-body-2 text-truncate-2 joss">
                  {{ report.description }}
                </p>
                <v-divider class="my-3"></v-divider>
                <div
                  class="d-flex align-center text-caption text-medium-emphasis joss"
                >
                  <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
                  {{ formatDate(report.created_at) }}
                </div>
              </v-card-text>

              <v-card-actions>
                <v-btn
                  variant="text"
                  color="primary"
                  @click="openDetailsDialog(report)"
                  size="small"
                >
                  View
                </v-btn>
                <v-btn
                  variant="text"
                  color="info"
                  @click="openEditDialog(report)"
                  size="small"
                  :disabled="!canModifyReport(report)"
                >
                  Edit
                </v-btn>
                <v-btn
                  variant="text"
                  color="error"
                  @click="openDeleteDialog(report)"
                  size="small"
                  :disabled="!canModifyReport(report)"
                >
                  Delete
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- Details Dialog -->
        <v-dialog v-model="isDetailsDialogOpen" max-width="600">
          <v-card v-if="selectedReport">
            <v-card-title class="bg-primary">
              <span class="text-h5 outfit-title">Report Details</span>
            </v-card-title>

            <v-card-text class="pt-4">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis joss mb-1">
                  Report ID
                </div>
                <div class="text-body-1 joss">#{{ selectedReport.id }}</div>
              </div>

              <div class="mb-4">
                <div class="text-caption text-medium-emphasis joss mb-1">
                  Title
                </div>
                <div class="text-body-1 outfit-title">
                  {{ selectedReport.title }}
                </div>
              </div>

              <div class="mb-4">
                <div class="text-caption text-medium-emphasis joss mb-1">
                  Status
                </div>
                <v-chip
                  :color="getStatusColor(selectedReport.status)"
                  class="joss"
                >
                  {{ selectedReport.status || "Pending" }}
                </v-chip>
              </div>

              <div class="mb-4">
                <div class="text-caption text-medium-emphasis joss mb-1">
                  Description
                </div>
                <div class="text-body-1 joss">
                  {{ selectedReport.description }}
                </div>
              </div>

              <div class="mb-4">
                <div class="text-caption text-medium-emphasis joss mb-1">
                  Submitted On
                </div>
                <div class="text-body-1 joss">
                  {{ formatDate(selectedReport.created_at) }}
                </div>
              </div>

              <div v-if="selectedReport.image_url" class="mb-4">
                <div class="text-caption text-medium-emphasis joss mb-2">
                  Attached Image
                </div>
                <v-img
                  :src="selectedReport.image_url"
                  max-height="300"
                  class="rounded"
                />
              </div>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" variant="text" @click="closeDialogs">
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Edit Dialog -->
        <v-dialog v-model="isEditDialogOpen" max-width="600">
          <v-card v-if="selectedReport">
            <v-card-title class="bg-primary">
              <span class="text-h5 outfit-title">Edit Report</span>
            </v-card-title>

            <v-card-text class="pt-4">
              <v-form @submit.prevent="handleEdit">
                <v-text-field
                  v-model="editForm.title"
                  label="Title"
                  variant="outlined"
                  required
                  class="mb-3"
                />

                <v-textarea
                  v-model="editForm.description"
                  label="Description"
                  variant="outlined"
                  rows="4"
                  required
                  class="mb-3"
                />

                <v-text-field
                  v-model.number="editForm.classroom_id"
                  label="Classroom/Facility ID"
                  type="number"
                  variant="outlined"
                  required
                  class="mb-3"
                />

                <v-text-field
                  v-model="editForm.image_url"
                  label="Image URL (Optional)"
                  variant="outlined"
                  class="mb-3"
                />
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="grey" variant="text" @click="closeDialogs">
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                @click="handleEdit"
                :loading="reportsStore.loading"
              >
                Save Changes
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="isDeleteDialogOpen" max-width="400">
          <v-card>
            <v-card-title class="text-h5 outfit-title">
              Confirm Delete
            </v-card-title>

            <v-card-text class="joss">
              Are you sure you want to delete this report? This action cannot be
              undone.
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="grey" variant="text" @click="closeDialogs">
                Cancel
              </v-btn>
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
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped>
/* Font imports */
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Jost:wght@100..900&display=swap");

.report-card {
  transition: transform 0.2s;
}

.report-card:hover {
  transform: translateY(-4px);
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Font classes */
.outfit-title {
  font-family: "Outfit", sans-serif;
}

.joss {
  font-family: "Jost", sans-serif;
}
</style>
