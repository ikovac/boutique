<template>
  <v-row :key="programId" no-gutters class="mt-4">
    <v-breadcrumbs v-if="program" :items="breadcrumbs" class="py-1" />
    <v-col cols="12">
      <v-tabs background-color="#f5f5f5" class="ml-2 mr-4">
        <v-tab
          v-for="({ name, label }) in tabs"
          :key="name"
          :to="{ name, params: { programId } }"
          exact
          ripple>
          {{ label }}
        </v-tab>
      </v-tabs>
      <router-view v-if="program" :program="program" />
    </v-col>
  </v-row>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import find from 'lodash/find';

export default {
  name: 'program',
  props: { programId: { type: Number, required: true } },
  computed: {
    ...mapState('programs', { programs: 'items' }),
    program() {
      return find(this.programs, { id: this.programId });
    },
    breadcrumbs() {
      return [
        { text: 'Programs', disabled: true },
        { text: this.program.name, disabled: true }
      ];
    },
    tabs() {
      return [
        { name: 'enrollments', label: 'Enrollments' },
        { name: 'importedContent', label: 'Content' },
        { name: 'programSettings', label: 'Settings' }
      ];
    }
  },
  methods: mapActions('programs', ['get']),
  created() {
    this.get(this.programId);
  }
};
</script>

<style lang="scss" scoped>
.v-tab {
  margin-left: 0 !important;
}

.v-breadcrumbs {
  padding-left: 18px;
}
</style>
