<template>
  <div class="card">
    <span class="card-close" @click="close"></span>
    <!-- <img :src="card.image" :alt="card.image"> -->
    <img :src="'http://contest.elecard.ru/frontend_data/'+card.image" alt="image placeholder">
    <div class="caption">
      <p>Category: {{ card.category }}</p>
      <p>File created: {{ formatDate }}</p>
      <p>File size: {{ formatBytes }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Card",
  props: {
    card: Object,
  },
  methods: {
    close() {
      // this.$cookies.set(this.card.image, this.card)
      this.$emit("cardClose", this.card);
    }
  },
  computed: {
    formatDate() {
      const date = new Date(this.card.timestamp);
      return date.getDate()+"."+(date.getMonth()+1)+"."+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
    },

    formatBytes() {
      const bytes = this.card.filesize, decimals = 2, k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 Bytes';
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals < 0 ? 0 : decimals)) + ' ' + sizes[i];
    }
  }
}
</script>

<style>
.card {
  flex: 1 1 calc((100% / 5) - 2rem);
  position: relative;
  overflow: hidden;
  border-radius: 0.3rem;
  background-color: #cae2e1;
  box-shadow: 5px 5px 5px -5px rgba(38, 47, 61, 0.3);
}
.card img {
  width: 100%;
}
.card-close {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  width: 1.25rem;
  height: 1.25rem;
  padding: 3px;
  border-radius: 3px;
  background-color: #213e70;
  opacity: 0.3;
}
.card-close:hover {
  opacity: 1;
}
.card-close:before, .card-close:after {
  position: absolute;
  left: calc(50% - 1.5px);
  content: ' ';
  height: 14px;
  width: 3px;
  background-color: #f6f4eb;
}
.card-close:before {
  transform: rotate(45deg);
}
.card-close:after {
  transform: rotate(-45deg);
}
.caption {
  padding: 1rem;
  background-color: #f6f4eb;
}
.caption p {
  margin: 0.5rem 0;
  font-size: 0.8rem;
}
.caption p:first-child {
  margin-top: 0;
}
.caption p:last-child {
  margin-bottom: 0;
}
</style>