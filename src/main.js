import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueShowdown from 'vue-showdown'
import GithubMarkdownCss from 'github-markdown-css'

Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.use(VueShowdown, {
  flavor: 'github',
  options: {
    emoji: true,
  }
})

Vue.use(GithubMarkdownCss)

new Vue({
  render: h => h(App),
}).$mount('#app')

