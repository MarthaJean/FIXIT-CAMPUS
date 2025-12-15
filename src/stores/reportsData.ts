import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";

export interface Report {
  id: number;
  created_at: string;
  title: string;
  description: string;
  classroom_id: number;
  user_id: string;
  image_url?: string;
}

export interface CreateReportPayload {
  title: string;
  description: string;
  classroom_id: number;
  user_id?: string;
  image_url?: string;
}

export interface UpdateReportPayload {
  title?: string;
  description?: string;
  classroom_id?: number;
  image_url?: string;
}

export const useReportsStore = defineStore("reports", () => {
  // State
  const reports = ref<Report[]>([]);
  const currentReport = ref<Report>();
  const loading = ref(false);
  const error = ref<string>();

  // Getters
  const reportById = computed(() => (id: number) => {
    return reports.value.find((report) => report.id === id);
  });

  const reportsByClassroom = computed(() => (classroomId: number) => {
    return reports.value.filter(
      (report) => report.classroom_id === classroomId
    );
  });

  const reportsByUser = computed(() => (userId: string) => {
    return reports.value.filter((report) => report.user_id === userId);
  });

  const totalReports = computed(() => reports.value.length);

  // Actions
  async function fetchReports() {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      reports.value = data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch reports";
      console.error("Error fetching reports:", err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchReportById(id: number) {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      currentReport.value = data;
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch report";
      console.error("Error fetching report:", err);
      return undefined;
    } finally {
      loading.value = false;
    }
  }

  async function fetchReportsByClassroom(classroomId: number) {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("reports")
        .select("*")
        .eq("classroom_id", classroomId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch classroom reports";
      console.error("Error fetching classroom reports:", err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchReportsByUser(userId: string) {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("reports")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch user reports";
      console.error("Error fetching user reports:", err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function createReport(payload: CreateReportPayload) {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: createError } = await supabase
        .from("reports")
        .insert(payload)
        .select()
        .single();

      if (createError) throw createError;

      reports.value.unshift(data);
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create report";
      console.error("Error creating report:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateReport(id: number, payload: UpdateReportPayload) {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: updateError } = await supabase
        .from("reports")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      const index = reports.value.findIndex((r) => r.id === id);
      if (index !== -1) {
        reports.value[index] = data;
      }

      if (currentReport.value?.id === id) {
        currentReport.value = data;
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update report";
      console.error("Error updating report:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteReport(id: number) {
    loading.value = true;
    error.value = undefined;

    try {
      const { error: deleteError } = await supabase
        .from("reports")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      reports.value = reports.value.filter((r) => r.id !== id);

      if (currentReport.value?.id === id) {
        currentReport.value = undefined;
      }

      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete report";
      console.error("Error deleting report:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = undefined;
  }

  function clearCurrentReport() {
    currentReport.value = undefined;
  }

  function $reset() {
    reports.value = [];
    currentReport.value = undefined;
    loading.value = false;
    error.value = undefined;
  }

  return {
    // State
    reports,
    currentReport,
    loading,
    error,

    // Getters
    reportById,
    reportsByClassroom,
    reportsByUser,
    totalReports,

    // Actions
    fetchReports,
    fetchReportById,
    fetchReportsByClassroom,
    fetchReportsByUser,
    createReport,
    updateReport,
    deleteReport,
    clearError,
    clearCurrentReport,
    $reset,
  };
});
