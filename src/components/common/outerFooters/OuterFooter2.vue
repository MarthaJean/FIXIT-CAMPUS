<script lang="ts" setup>
import type { UIConfig } from "@/controller/landingController";
import { computed } from "vue";

interface Props {
  config?: UIConfig | null;
}

const props = defineProps<Props>();

const footerConfig = computed(() => props.config?.footer);
const currentYear = computed(() => new Date().getFullYear());

function openLink(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
</script>

<template>
  <v-footer
    v-if="config?.showFooter && footerConfig"
    app
    class="text-white"
    :color="footerConfig.color"
    elevation="4"
  >
    <v-container>
      <!-- Social Links and Technologies Section -->
      <v-row justify="center" class="text-center">
        <v-col cols="12" md="8" lg="6">
          <!-- Social Links as Chips -->
          <div class="mb-6">
            <v-chip
              v-for="social in footerConfig.socialLinks"
              :key="social.platform"
              :aria-label="social.label"
              class="ma-1"
              color="primary"
              variant="outlined"
              size="large"
              @click="openLink(social.url)"
            >
              <template #prepend>
                <v-icon :icon="social.icon" />
              </template>
              {{ social.label }}
            </v-chip>
          </div>

          <!-- Technologies Section with Enhanced Styling -->
          <div class="mb-6">
            <div class="text-body-2 text-grey-lighten-2 mb-3 outfit-title">
              Powered by
            </div>

            <v-row justify="center" class="no-gutters">
              <v-col
                v-for="(tech, index) in footerConfig.technologies"
                :key="tech.name"
                cols="auto"
                class="mx-2"
              >
                <div class="pa-3 text-center">
                  <v-icon
                    :icon="tech.icon"
                    :color="tech.color"
                    size="24"
                    class="mb-1"
                  />
                  <div class="text-caption font-weight-medium joss">
                    {{ tech.name }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>

      <!-- Bottom Section with Divider -->
      <v-divider class="my-4" color="rgba(255, 255, 255, 0.2)" />

      <v-row justify="center" class="text-center">
        <v-col cols="12">
          <div class="text-caption text-grey-lighten-1 outfit-title">
            {{ currentYear }} © {{ footerConfig.copyright }}
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Jost:wght@100..900&display=swap");

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
</style>
