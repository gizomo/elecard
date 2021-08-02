<template>
  <li>
    <span :class="{ file: !isFolder, toggle: isFolder }" @click="toggle">
      <span v-if="isFolder">[{{ isOpen ? '-' : '+' }}]</span>
      <span
        v-if="'image' in item"
        class="thumbnail"
        :style="{ backgroundImage: 'url(http://contest.elecard.ru/frontend_data/' + item.image + ')' }"
        @click="openLightBox"
      ></span>
      {{ item.name || item.image.split("/")[1] }}
    </span>
    <ul v-show="isOpen" v-if="isFolder">
      <tree-item 
        v-for="(child, index) in item.children"
        :key="index"
        :item="child"
      ></tree-item>
    </ul>
  </li>
  <light-box v-if="!isFolder" ref="openLightBox">
    <img :src="'http://contest.elecard.ru/frontend_data/'+item.image" :alt="item.image.split('/')[1]">
  </light-box>
</template>

<script>
import LightBox from "./LightBox.vue";

export default {
  name: "TreeItem",
  components: {
    LightBox
  },
  template: "#item-template",
  props: {
    item: Object
  },
  data() {
    return {
      isOpen: false
    }
  },
  computed: {
    isFolder() {
      return this.item.children && this.item.children.length;
    }
  },
  methods: {
    toggle() {
      if (this.isFolder) {
        this.isOpen = !this.isOpen;
      }
    },
    async openLightBox() {
      await this.$refs.openLightBox.open();
    }
  },
  mounted() {
    if (this.item.name === 'Images Catalog') {
      this.isOpen = true;
    }
  }
}
</script>

<style>
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: none;
}
.toggle {
  cursor: pointer;
}
.file {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.25rem;
}
.thumbnail {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  background-position: center;
  background-size: cover;
  border: 1px solid transparent;
  cursor: pointer;
  filter: saturate(0)
}
.thumbnail:hover {
  border: 1px solid #213e70;
  filter: saturate(1);
}
</style>
