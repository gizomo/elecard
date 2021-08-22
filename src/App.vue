<template>
  <header id="header">
    <h1>Challenge Boro 2021.02 frontend</h1>
    <div class="view-switches">
      <input type="radio" id="card-switch" value="card" v-model="radioSwitch">
      <label :class="{ checked: (radioSwitch == 'card') }" for="card-switch">Cards</label>
      <input type="radio" id="tree-switch" value="tree" v-model="radioSwitch">
      <label :class="{ checked: (radioSwitch == 'tree') }" for="tree-switch">Tree</label>
    </div>
  </header>
  <div class="main">
    <div v-if="loading" class="loader"></div>
    <transition name="slide-fade" mode="out-in">
      <div class="cards-view" v-if="radioSwitch == 'card'">
        <div class="cards-menu">
          <div class="sort-orders">
            <span>Sorted by:</span>
            <div class="sort-buttons-wrapper">
              <span class="sort-button" v-for="(sortkey, idx) in Object.keys(orderedCatalogOptions)" :key="idx">
                <input type="radio" :id="sortkey" :value="sortkey" v-model="sortOrder">
                <label :class="{ checked: (sortOrder == sortkey) }" :for="sortkey">{{ sortkey }}</label>
              </span>
            </div>
          </div>
        </div>
        <div class="pagination">
          <div class="pagination-buttons">
            <button v-if="page > 1" @click="page = page - 1">&#8249; Previous</button>
            <button v-if="hasNextPage" @click="page = page + 1">Next &#8250;</button>
          </div>
          <button class="cards-restore" v-if="hasSavedCards()" @click="restoreCards()">Restore cards</button>
        </div>
        <div class="cards">
          <card v-for="(item, idx) in paginatedCards" :card="item" :key="idx" @cardClose="removeCard"></card>
        </div>
      </div>
      <div class="tree-view" v-else>
        <ul>
          <tree-item :item="treeData"></tree-item>
        </ul>
      </div>
    </transition>
  </div>
  <footer><p>Developted by Ivan Godenov, 2021</p></footer>
</template>

<script>
import Card from "./Card.vue";
import TreeItem from "./TreeItem.vue";

export default {
  name: 'App',
  components: {
    Card,
    TreeItem
  },
  data() {
    return {
      radioSwitch: "card",
      loading: false,

      catalog: [],
      treeData: {
        "name": "Images Catalog",
        "children": [],
      },
      sortOrder: "Category",

      page: 1,
    };
  },
  methods: {
    async getCatalogData() {
      this.loading = true;
      try {
        const res = await fetch("http://contest.elecard.ru/frontend_data/catalog.json");
        const catalogData = await res.json();
        this.loading = false;
        return catalogData;
      }
      catch (error) {
        console.log(error);
        this.loading = false;
      }
    },
    saveCard(card) {
      const catalogId = "cardId_" + (new Date()).getTime();
      localStorage.setItem(catalogId, JSON.stringify(card));
    },
    removeCatalogItem(card) {
      const index = this.catalog.findIndex(item => item.image === card.image);
      if (index !== -1) this.catalog.splice(index, 1);
    },
    removeCard(card) {
      this.saveCard(card);
      this.removeCatalogItem(card);
    },
    hasSavedCards() {
      return Object.keys(localStorage).some(name => name.startsWith("cardId_"));
    },
    getRemovedCards() {
      return Object.keys(localStorage)
        .filter(key => key.startsWith("cardId_"))
        .map(name => {
          return JSON.parse(localStorage.getItem(name)).image;
        });
    },
    restoreCards() {
      Object.keys(localStorage)
      .filter(key => key.startsWith("cardId_"))
      .forEach(cardId => localStorage.removeItem(cardId));
      this.getCatalogData().then(tmpCatalog => {
        this.catalog = tmpCatalog;
      });
    },
    sortCatalog(sortOrder) {
      return this.orderedCatalogOptions[sortOrder]();
    },
  },
  computed: {
    orderedCatalogOptions() {
      return {
        "Category": () => { return this.catalog.sort((a, b) => a.category.localeCompare(b.category)) },
        "Date": () => { return this.catalog.sort((a, b) => { return a.timestamp - b.timestamp; }); },
        "File size": () => { return this.catalog.sort((a, b) => { return a.filesize - b.filesize; }); },
      };
    },
    startIndex() {
      return (this.page - 1) * 20;
    },
    endIndex() {
      return this.page * 20;
    },
    paginatedCards() {
      return this.sortCatalog(this.sortOrder).slice(this.startIndex, this.endIndex);
    },
    hasNextPage() {
      return this.sortCatalog(this.sortOrder).length > this.endIndex;
    },
    pageStateOptions() {
      return {
        page: this.page,
      };
    },
  },
  watch: {
    paginatedCards() {
      if (this.paginatedCards.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },
    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?page=${value.page}`
      );
    },
  },
  created() {
    this.getCatalogData().then(tmpCatalog => {
      tmpCatalog.forEach(item => {
        if (!this.treeData.children.some(obj => obj.name === item.category)) {
          this.treeData.children.push({
            name: item.category,
            children: tmpCatalog.filter(file => file.category === item.category)
          });
        }
      });
      if (this.hasSavedCards()) {
        this.catalog = tmpCatalog.filter(item => !this.getRemovedCards().includes(item.image));
      } else {
        this.catalog = tmpCatalog;
      }
    });

    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    const VALID_KEYS = ["page"];

    VALID_KEYS.forEach(key => {
      if (windowData[key]) {
        this[key] = windowData[key];
      }
    });
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f3f3f3;
}
#app {
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
}
#card-switch, #tree-switch {
  display: none;
}
.view-switches {
  display: inline-block;
  border: 5px solid #f3f3f3;
  border-radius: 2rem;
  overflow: hidden;
}
.view-switches label {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #81aec6;
  cursor: pointer;
}
.view-switches label:hover {
  filter: brightness(110%);
}
.view-switches label.checked {
  color: #81aec6;
  background-color: #f3f3f3;
  filter: brightness(1);
  cursor: auto;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  color: #fff;
  background-color: #81aec6;
  box-shadow: 0px 5px 10px 2px rgba(38, 47, 61, 0.3);
  z-index: 10;
}
footer {
  padding: 1rem 2rem;
  color: #fff;
  background-color: #81aec6;
  box-shadow: 0px -5px 10px 2px rgba(38, 47, 61, 0.3);
  z-index: 10;
}
.loader {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border: 1rem solid #e2e2e2;
  border-top: 1rem solid #213e70;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  animation: spin 2s linear infinite;
}
.main {
  position: relative;
  padding: 1rem;
  overflow: auto;
}
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 2rem;
}
.cards-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.sort-orders {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 700;
  color: #81aec6;
}
.sort-buttons-wrapper {
  border-radius: 0.5rem;
  border: 2px solid #81aec6;
  box-shadow: 5px 5px 5px -5px rgba(38, 47, 61, 0.3);
  overflow: hidden;
}
.sort-button input {
  display: none;
}
.sort-button label {
  display: inline-block;
  padding: 0.15rem 1rem;
  font-weight: 500;
  text-transform: lowercase;
  color: #81aec6;
  border: 1px solid #81aec6;
  background-color: #f3f3f3;
  cursor: pointer;
}
.sort-button label:hover {
  filter: brightness(95%);
}
.sort-button label.checked {
  color: #f3f3f3;
  background-color: #81aec6;
  filter: brightness(1);
  cursor: auto;
}
.pagination {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.pagination-buttons {
  display: flex;
  gap: 1rem;
}
.pagination-buttons button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 1rem;
  box-shadow: 5px 5px 5px -5px rgba(38, 47, 61, 0.3);
  font-weight: 700;
  color: #f3f3f3;
  background-color: #81aec6;
  cursor: pointer;
}
.pagination button:hover {
  filter: brightness(110%);
}
.cards-restore {
  display: inline;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 3px;
  box-shadow: 5px 5px 5px -5px rgba(38, 47, 61, 0.8);
  color: #fff;
  background-color: #213e70;
  opacity: 0.5;
}
.cards-restore:hover {
  cursor: pointer;
  opacity: 1;
}

.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(50%);
  opacity: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media screen and (max-width: 60em) {
  header {
    display: block;
  }
}
</style>
