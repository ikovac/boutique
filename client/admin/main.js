import App from './App';
import format from 'date-fns/format';
import router from './router';
import store from './store';
import VeeValidate from '@/common/validation';
import Vue from 'vue';
import VueHotkey from 'v-hotkey';
import vuetify from '@/plugins/vuetify';
import VueVisible from 'vue-visible';

Vue.use(VeeValidate, {
  delay: 700,
  fieldsBagName: 'vFields',
  errorBagName: 'vErrors',
  inject: false
});
Vue.use(VueHotkey);
Vue.use(VueVisible);

Vue.filter('formatDate', (value, dateFormat = 'MM/dd/yy HH:mm') => {
  return value && format(new Date(value), dateFormat);
});

// eslint-disable-next-line no-new
new Vue({
  store,
  router,
  vuetify,
  el: '#app',
  render: h => h(App)
});
