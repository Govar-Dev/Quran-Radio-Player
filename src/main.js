import Vue from 'vue'
import App from './App.vue'
import lodash from 'lodash'
import VueLodash from 'vue-lodash'


Vue.config.productionTip = false
import WAudioplayerVue from 'w-audioplayer-vue'
Vue.component('w-audioplayer-vue', WAudioplayerVue)
Vue.use(VueLodash, { lodash: lodash })

import helpers from './helpers.js'
Vue.mixin(helpers)


window.app = new Vue({
    render: h => h(App),
}).$mount('#app')