import Vue from 'vue';
import Vuex from 'vuex';

import auth from '@/common/store/modules/auth';
import plugins from '@/common/store/plugins';
import programs from '@/admin/store/modules/programs';
import users from '@/admin/store/modules/users';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth,
    programs,
    users
  },
  plugins
});
