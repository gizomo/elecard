<template>
  <div v-if="isOpen" class="backdrop" @click="close">
    <div class="lightbox" @click.stop>
      <span class="card-close" @click="close"></span>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  currentLightBoxController: null,

  data() {
    return { isOpen: false };
  },

  mounted() {
    document.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  },
  methods: {
    handleKeydown(e) {
      if (this.isOpen && e.key === "Escape") this.close();
    },
    open() {
      let resolve;
      let reject;
      const lightBoxPromise = new Promise((ok, fail) => {
        resolve = ok;
        reject = fail;
      });

      this.$options.lightBoxController = { resolve, reject };
      this.isOpen = true;

      return lightBoxPromise;
    },
    close() {
      this.$options.lightBoxController.resolve(false);
      this.isOpen = false;
    },
  },
};
</script>

<style scoped>
.lightbox {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0.5rem;
  background-color: #f6f4eb;
  border-radius: 0.5rem;
  z-index: 100;
}
.lightbox .card-close {
  right: 1rem;
  top: 1rem;
}
.lightbox img {
  display: block;
  border-radius: 0.25rem;
}
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(38, 47, 61, 0.7);
  z-index: 100;
}
</style>