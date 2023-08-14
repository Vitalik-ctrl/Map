<template>
  <div id="app">
    <MapComponent :initialCenter="initialCenter" />
  </div>
</template>

<script>
import MapComponent from './components/MapComponent.vue';

export default {
  name: 'App',
  components: {
    MapComponent
  },
  data() {
    return {
      initialCenter: {
        lat: 50.08742335459363,
        lng: 14.42131519317627
      }
    };
  }
};
</script>

<style>
#app {
  display: grid;
  place-items: center;
  height: 100vh;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  vertical-align: middle;
}
</style>