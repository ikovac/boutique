<template>
  <v-dialog v-model="visible" v-hotkey="{ esc: close }" width="500">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" color="success" outlined>Enroll learner</v-btn>
    </template>
    <v-form @submit.prevent="enroll">
      <v-card class="pa-3">
        <v-card-title class="headline">Enroll learner</v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="learnerId"
            v-validate="{
              required: true,
              'unique-enrollment': { learnerId, programId }
            }"
            @focus="focusTrap.pause()"
            @blur="focusTrap.unpause()"
            :items="learners"
            :search-input.sync="email"
            :error-messages="vErrors.collect('learner')"
            :loading="isLoading"
            label="Learner"
            placeholder="Start typing to Search"
            prepend-icon="mdi-magnify"
            clearable
            name="learner" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="close">Cancel</v-btn>
          <v-btn color="success" outlined type="submit">Enroll</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import enrollmentApi from '@/admin/api/enrollment';
import map from 'lodash/map';
import pick from 'lodash/pick';
import userApi from '@/admin/api/user';
import { withFocusTrap } from '@/common/focustrap';
import { withValidation } from '@/common/validation';

const el = vm => vm.$children[0].$refs.dialog;

export default {
  name: 'enrollment-dialog',
  mixins: [withValidation(), withFocusTrap({ el })],
  props: {
    programId: { type: Number, required: true }
  },
  data() {
    return {
      visible: false,
      email: null,
      learnerId: null,
      learners: [],
      isLoading: false
    };
  },
  methods: {
    enroll() {
      this.$validator.validateAll().then(isValid => {
        if (!isValid) return;
        enrollmentApi.create(pick(this, ['learnerId', 'programId'])).then(() => {
          this.close();
          this.$emit('enrolled');
        });
      });
    },
    close() {
      this.visible = false;
      this.learnerId = null;
    },
    fetch(email) {
      if (this.learnerId) return;
      this.isLoading = true;
      const params = { emailLike: email, role: 'LEARNER', limit: 30 };
      return userApi.fetch({ params })
        .then(({ items: learners }) => {
          this.learners = map(learners, it => ({
            text: `${it.email} - ${it.firstName} ${it.lastName}`,
            value: it.id
          }));
        })
        .finally(() => (this.isLoading = false));
    }
  },
  watch: {
    email(val) {
      if (val) this.fetch(val);
    },
    visible(val) {
      this.$nextTick(() => this.focusTrap.toggle(val));
      if (!val) return;
      this.vErrors.clear();
      this.fetch();
    }
  },
  mounted() {
    if (this.$validator.rules['unique-enrollment']) return;
    this.$validator.extend('unique-enrollment', {
      getMessage: field => 'Learner is already enrolled!',
      validate: (option, params) => {
        return enrollmentApi.fetch({ params }).then(res => !res.total);
      }
    });
  }
};
</script>
