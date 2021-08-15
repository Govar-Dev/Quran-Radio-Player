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

var VueScrollTo = require('vue-scrollto');
Vue.use(VueScrollTo, {
    container: ".music",
    duration: 500,
    easing: "ease",
    offset: -100,
    force: true,
    cancelable: true,
    onStart: false,
    onDone: false,
    onCancel: false,
    x: false,
    y: true
})


window.app = new Vue({
    render: h => h(App),
}).$mount('#app')