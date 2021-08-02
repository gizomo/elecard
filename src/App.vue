<template>
  <header id="header">
    <h1>Challenge Boro 2021.02 frontend</h1>
    <div class="switchView">
      <span>View: </span>
      <input type="radio" id="card" value="card" v-model="radioSwitch">
      <label for="card">Card</label>
      <input type="radio" id="tree" value="tree" v-model="radioSwitch">
      <label for="tree">Tree</label>
    </div>
  </header>
  <div v-if="loading" class="loader"></div>
  <div class="main">
    <div class="cards-view" v-if="radioSwitch == 'card'">
      <div class="cards-menu">
        <div class="sort-orders">
          <span>Sorted by: </span>
          <span v-for="(sortkey, idx) in Object.keys(orderedCatalogOptions)" :key="idx">
            <input type="radio" :id="sortkey" :value="sortkey" v-model="sortOrder">
            <label for="sortkey">{{ sortkey }}</label>
          </span>
        </div>
        <button class="cards-restore" v-if="hasSavedCards()" @click="restoreCards()">Restore cards</button>
      </div>
      <div class="pagination">
        <button v-if="page > 1" @click="page = page - 1">Previous</button>
        <button v-if="hasNextPage" @click="page = page + 1">Next</button>
      </div>
      <div class="cards">
        <card v-for="(item, idx) in paginatedCards" :card="item" :key="idx" @cardClose="removeCard"></card>
        <!-- <card v-for="(item, idx) in sortCatalog(sortOrder)" :card="item" :key="idx" @cardClose="removeCard"></card> -->
      </div>
    </div>
    <div class="tree" v-else>
      <h2>Tree</h2>
    </div>
  </div>
  <footer><p>This is a footer</p></footer>
</template>

<script>
import Card from "./Card.vue";

export default {
  name: 'App',
  components: {
    Card,
  },
  data() {
    return {
      radioSwitch: "card",
      loading: false,

      catalog: [],
      sortOrder: "Category",

      page: 1,
    };
  },
  methods: {
    handleScroll() {
      const header = document.getElementById("header");
      const sticky = header.offsetTop;
      if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
    },
    saveCard(card) {
      const catalogId = "cardId_" + (new Date()).getTime();
      this.$cookies.set(catalogId, card);
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
      return this.$cookies.keys().some(name => name.startsWith("cardId_"));
    },
    getRemovedCards() {
      let vm = this;
      return this.$cookies.keys()
        .filter(key => key.startsWith("cardId_"))
        .map(name => {
          return vm.$cookies.get(name).image;
        });
    },
    restoreCards() {
      let vm = this;
      this.$cookies.keys()
      .filter(key => key.startsWith("cardId_"))
      .forEach(cardId => vm.$cookies.remove(cardId));
      window.location.reload();
    },
    sortCatalog(sortOrder) {
      return this.orderedCatalogOptions[sortOrder]();
    },
  },
  computed: {
    orderedCatalogOptions() {
      return {
        // "Category": () => { return this.catalog.sort((a, b) => { return (a.category > b.category) ? 1 : -1; }); },
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
    }
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
  async created() {
    this.loading = true;
    try {
      const res = await fetch("http://contest.elecard.ru/frontend_data/catalog.json");
      let tmpCatalog = await res.json();
      if (this.hasSavedCards()) {
        this.catalog = tmpCatalog.filter(item => !this.getRemovedCards().includes(item.image));
      } else {
        this.catalog = tmpCatalog;
      }
      this.loading = false;
    }
    catch (error) {
      console.log(error);
      this.loading = false;
    }

    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    const VALID_KEYS = ["page"];

    VALID_KEYS.forEach(key => {
      if (windowData[key]) {
        this[key] = windowData[key];
      }
    });
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
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
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background-color: #81aec6;
  box-shadow: 0px 5px 10px 2px rgba(38, 47, 61, 0.3);
}
footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 1rem 2rem;
  background-color: #81aec6;
}
.sticky {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;
}
.loader {
  border: 16px solid #f3f3f3;
  border-top: 16px solid #213e70;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 2s linear infinite;
}
.main {
  padding: 1rem;
}
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 6rem;
}
.cards-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.pagination {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.cards-restore {
  display: inline;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 3px;
  color: #fff;
  background-color: #213e70;
  opacity: 0.5;
}
.cards-restore:hover {
  cursor: pointer;
  opacity: 1;
  box-shadow: 5px 5px 5px -5px rgba(38, 47, 61, 0.3);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
