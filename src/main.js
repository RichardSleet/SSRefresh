import Vue from 'vue'
import Index from './Index.vue'

if (process.env.NODE_ENV === 'development') {
  new Vue({
    el: '#app',
    render: h => h(Index)
  })
} else {
  Index.install = function(Vue){
    Vue.use(Index);
  };
  module.exports = Index;
}
export default Index;