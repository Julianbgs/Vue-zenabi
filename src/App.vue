<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script lang="js">
import AppHeader from './components/AppHeader'
import AppSidebar from './components/AppSidebar'
import AppFooter from './components/AppFooter'
  export default {
    name: 'app',
    components: {
        AppHeader,
        AppSidebar,
        AppFooter
    }
  }
</script>

<style>
  @import "../node_modules/mdi/css/materialdesignicons.min.css";
  @import "../node_modules/flag-icon-css/css/flag-icon.min.css";
  @import "../node_modules/font-awesome/css/font-awesome.min.css";
</style>

<style lang="scss">
  @import "./assets/scss/style";
</style>
