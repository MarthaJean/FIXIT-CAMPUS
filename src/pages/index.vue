<script lang="ts" setup>
import { onMounted } from "vue";
import { useLandingController } from "@/controller/landingController";
import OuterLayoutWrapper from "@/layouts/OuterLayoutWrapper.vue";

const { data, loading, error, fetchLandingData } = useLandingController();

onMounted(async () => {
  await fetchLandingData();
});

function scrollToFeatures() {
  const element = document.querySelector("#features");
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

function openGithub() {
  window.open("https://github.com", "_blank", "noopener,noreferrer");
}

function openDocumentation() {
  window.open("https://vuetifyjs.com/", "_blank", "noopener,noreferrer");
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<template>
  <OuterLayoutWrapper>
    <template #content>
      <div class="landing-view">
        <!-- Loading State -->
        <v-container
          v-if="loading"
          class="d-flex justify-center align-center"
          style="min-height: 50vh"
        >
          <img
            src="@/assets/loading.gif"
            alt="Loading..."
            style="width: 200px; height: auto"
          />
        </v-container>

        <!-- Error State -->
        <v-container
          v-else-if="error"
          class="d-flex justify-center align-center"
          style="min-height: 50vh"
        >
          <v-alert
            color="error"
            icon="mdi-alert-circle"
            type="error"
            variant="tonal"
          >
            <v-alert-title>Failed to load content</v-alert-title>
            {{ error }}
          </v-alert>
        </v-container>

        <!-- Content -->
        <div v-else-if="data">
          <!-- Hero Section -->
          <section class="hero-section">
            <v-container fluid class="hero-container">
              <div class="hero-card">
                <v-row align="center" class="fill-height" no-gutters>
                  <!-- Left Side - Image/Illustration -->
                  <v-col cols="12" md="6" class="image-col">
                    <div class="image-wrapper">
                      <div class="decorative-blob blob-1"></div>
                      <div class="decorative-blob blob-2"></div>
                      <div class="decorative-blob blob-3"></div>
                      <img
                        src="@/assets/logo.png"
                        alt="FixIt Campus"
                        class="hero-image"
                      />
                      <!-- Decorative icons -->
                      <div class="floating-icon icon-1">
                        <v-icon size="32" color="white">mdi-wrench</v-icon>
                      </div>
                      <div class="floating-icon icon-2">
                        <v-icon size="28" color="white">mdi-hammer</v-icon>
                      </div>
                      <div class="floating-icon icon-3">
                        <v-icon size="24" color="white">mdi-tools</v-icon>
                      </div>
                      <div class="floating-icon icon-4">
                        <v-icon size="30" color="white">mdi-cog</v-icon>
                      </div>
                    </div>
                  </v-col>

                  <!-- Right Side - Content -->
                  <v-col cols="12" md="6" class="content-col">
                    <div class="content-wrapper">
                      <h1 class="display-title outfit-title mb-4">
                        {{ data.title }}
                      </h1>

                      <h2 class="subtitle jost-text mb-6">
                        {{ data.subtitle }}
                      </h2>

                      <p class="description jost-text mb-8">
                        {{ data.description }}
                      </p>

                      <div class="button-group d-flex gap-3 mb-8">
                        <v-btn
                          class="text-none cta-button primary-btn"
                          size="large"
                          rounded="pill"
                          elevation="0"
                          @click="scrollToFeatures"
                        >
                          Explore Features
                        </v-btn>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-container>
          </section>

          <!-- Features Section -->
          <section id="features" class="features-section">
            <v-container class="py-16">
              <div class="text-center mb-12">
                <h2 class="section-title outfit-title mb-40">Key Features</h2>
              </div>

              <v-row>
                <v-col
                  v-for="(feature, index) in data.features"
                  :key="index"
                  cols="12"
                  lg="3"
                  md="6"
                >
                  <div class="feature-card">
                    <div class="feature-icon-wrapper">
                      <v-icon :icon="feature.icon" size="40" color="white" />
                    </div>

                    <h3 class="feature-title outfit-title">
                      {{ feature.title }}
                    </h3>

                    <p class="feature-description jost-text">
                      {{ feature.description }}
                    </p>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </section>

          <!-- About Section -->
          <section id="about" class="about-section">
            <v-container class="py-10">
              <v-row align="center" justify="center">
                <v-col cols="10" lg="10" md="9">
                  <div class="about-card">
                    <v-row align="center" class="about-content">
                      <v-col cols="10" md="7">
                        <div class="about-info">
                          <div class="info-item mb-5">
                            <div class="info-badge jost-text">VERSION</div>
                            <h3 class="info-value outfit-title">
                              {{ data.version }}
                            </h3>
                          </div>

                          <div class="info-item mb-5">
                            <div class="info-badge jost-text">CREATED BY</div>
                            <p class="info-value outfit-title">
                              {{ data.author }}
                            </p>
                          </div>

                          <div class="info-item">
                            <div class="info-badge jost-text">LAST UPDATED</div>
                            <p class="info-text jost-text">
                              {{ formatDate(data.lastUpdated) }}
                            </p>
                          </div>
                        </div>
                      </v-col>

                      <v-col cols="12" md="5">
                        <div class="about-actions">
                          <v-btn
                            block
                            class="text-none documentation-btn"
                            size="x-large"
                            rounded="pill"
                            elevation="0"
                            @click="openDocumentation"
                          >
                            <v-icon class="me-2" icon="mdi-book-open" />
                            View Document
                          </v-btn>

                          <v-btn
                            block
                            class="text-none github-btn mt-4"
                            size="x-large"
                            rounded="pill"
                            elevation="0"
                            variant="outlined"
                            @click="openGithub"
                          >
                            <v-icon class="me-2" icon="mdi-github" />
                            View on GitHub
                          </v-btn>
                        </div>
                      </v-col>
                    </v-row>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </section>
        </div>
      </div>
    </template>
  </OuterLayoutWrapper>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Jost:wght@100..900&display=swap");

.outfit-title {
  font-family: "Outfit", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
}

.jost-text {
  font-family: "Jost", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
}

/* Hero Section Styles */
.hero-section {
  min-height: 100vh;
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hero-card {
  background: #ffc1da;
  border-radius: 32px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  min-height: 600px;
  position: relative;
  overflow: hidden;
}

/* Image Column */
.image-col {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
}

.image-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-image {
  width: 80%;
  height: auto;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Decorative Blobs */
.decorative-blob {
  position: absolute;
  border-radius: 50%;
  opacity: 0.3;
  z-index: 1;
}

.blob-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #e994ae 0%, transparent 70%);
  top: 10%;
  left: 5%;
}

.blob-2 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, #eea9bf 0%, transparent 70%);
  bottom: 15%;
  right: 10%;
}

.blob-3 {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, #f4becf 0%, transparent 70%);
  top: 50%;
  right: 5%;
}

/* Floating Icons */
.floating-icon {
  position: absolute;
  z-index: 3;
  animation: bounce 2s ease-in-out infinite;
}

.icon-1 {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.icon-2 {
  top: 25%;
  right: 15%;
  animation-delay: 0.5s;
}

.icon-3 {
  bottom: 20%;
  left: 15%;
  animation-delay: 1s;
}

.icon-4 {
  bottom: 30%;
  right: 10%;
  animation-delay: 1.5s;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(5deg);
  }
  75% {
    transform: translateY(-5px) rotate(-5deg);
  }
}

/* Content Column */
.content-col {
  display: flex;
  align-items: center;
  padding: 2rem;
}

.content-wrapper {
  max-width: 600px;
}

.tagline {
  color: #000000;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.display-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  color: #000000;
  line-height: 1.1;
  letter-spacing: -1px;
}

.subtitle {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 400;
  color: #000000;
  line-height: 1.4;
}

.description {
  font-size: 1rem;
  color: #000000;
  line-height: 1.6;
  max-width: 500px;
}

/* Buttons */
.button-group {
  flex-wrap: wrap;
}

.cta-button {
  font-family: "Jost", sans-serif;
  font-weight: 600;
  letter-spacing: 0.3px;
  padding: 0 2rem !important;
  height: 48px !important;
}

.primary-btn {
  background: #e37f9d !important;
  color: white !important;
  transition: all 0.3s ease;
}

.primary-btn:hover {
  background: #e994ae !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(227, 127, 157, 0.3) !important;
}

.secondary-btn {
  border: 2px solid #e37f9d !important;
  color: #e37f9d !important;
  background: transparent !important;
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  background: #e37f9d !important;
  color: white !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(227, 127, 157, 0.2) !important;
}

.footer-text {
  font-size: 0.875rem;
  color: #000000;
  font-weight: 400;
}

/* Responsive Design */
@media (max-width: 960px) {
  .hero-card {
    padding: 2rem 1.5rem;
    min-height: auto;
  }

  .image-col {
    order: 2;
    padding: 1rem;
  }

  .content-col {
    order: 1;
    padding: 1rem;
  }

  .image-wrapper {
    max-width: 300px;
  }

  .floating-icon {
    display: none;
  }

  .content-wrapper {
    text-align: center;
  }

  .button-group {
    justify-content: center;
  }

  .description {
    margin-left: auto;
    margin-right: auto;
  }
}

/* Features Section Styles */
.features-section {
  min-height: 100vh;
  padding: 4rem 0;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.section-tagline {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.section-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  line-height: 1.2;
}

.section-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  max-width: 600px;
  margin: 0 auto;
}

.feature-card {
  background: #ffc1da;
  border-radius: 24px;
  padding: 2.5rem 1.5rem;
  height: 100%;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f4becf 0%, #f9d3e0 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.feature-card:hover::before {
  opacity: 0.1;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: #eea9bf;
  box-shadow: 0 12px 40px rgba(227, 127, 157, 0.15);
}

.feature-icon-wrapper {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #e37f9d 0%, #e994ae 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 24px rgba(227, 127, 157, 0.25);
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
}

.feature-card:hover .feature-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.feature-title {
  font-size: 1.5rem;
  color: #000000;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
  position: relative;
  z-index: 1;
}

.feature-description {
  font-size: 1rem;
  color: #000000;
  line-height: 1.6;
  text-align: center;
  position: relative;
  z-index: 1;
}

/* About Section Styles */
.about-section {
  min-height: 100vh;
  padding: 4rem 0;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.about-card {
  background: #ffc1da;
  border-radius: 32px;
  padding: 3rem 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.about-content {
  position: relative;
  color: #000000;
  z-index: 1;
}

.about-info {
  padding: 1rem 0;
}

.info-item {
  padding-bottom: 1.5rem;
  border-bottom: 2px solid rgba(227, 127, 157, 0.1);
}

.info-item:last-child {
  border-bottom: none;
}

.info-badge {
  display: inline-block;
  background: rgba(227, 127, 157, 0.15);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.info-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.info-text {
  font-size: 1.125rem;
  margin: 0;
}

.about-actions {
  padding: 1rem;
}

.documentation-btn {
  background: #e37f9d !important;
  color: white !important;
  font-family: "Jost", sans-serif;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.documentation-btn:hover {
  background: #e994ae !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(227, 127, 157, 0.3) !important;
}

.github-btn {
  border: 2px solid #e37f9d !important;
  color: #e37f9d !important;
  background: transparent !important;
  font-family: "Jost", sans-serif;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.github-btn:hover {
  background: #e37f9d !important;
  color: white !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(227, 127, 157, 0.2) !important;
}

@media (max-width: 960px) {
  .about-card {
    padding: 2rem 1.5rem;
  }

  .about-info {
    margin-bottom: 2rem;
  }

  .feature-card {
    margin-bottom: 1.5rem;
  }
}

.min-height-screen {
  min-height: calc(100vh - 64px);
}

.gap-4 {
  gap: 1rem;
}

.landing-view {
  min-height: 100vh;
}
</style>
