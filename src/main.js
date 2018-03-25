import Vue from 'vue';
import Demo from './Demo';
import Index from './Index'

new Vue({
  el: '#app',
  template: '<Demo/>',
  components: { Demo }
})

// if (process.env.NODE_ENV === 'development') {
//   new Vue({
//     el: '#app',
//     template: '<Demo/>',
//     components: { Demo }
//   })
// } else {
//   Index.install = function(Vue){
//     Vue.use(Index);
//   };
// }
// export default Index;