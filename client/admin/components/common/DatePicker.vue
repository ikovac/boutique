<template>
  <v-menu
    :disabled="disabled"
    full-width
    min-width="290px"
    offset-y
    transition="scale-transition">
    <template v-slot:activator="{ on }">
      <v-text-field
        v-validate="processedValidation"
        v-on="on"
        :name="name"
        :value="normalizedValue"
        :label="label"
        :disabled="disabled"
        :error-messages="vErrors.collect(name)"
        :data-vv-as="label"
        append-icon="mdi-calendar"
        readonly />
    </template>
    <v-date-picker @input="save($event)" :value="normalizedValue" no-title />
  </v-menu>
</template>

<script>
import format from 'date-fns/format';
import get from 'lodash/get';
import omit from 'lodash/omit';
import parse from 'date-fns/parse';

const DATE_FORMAT = 'yyyy-MM-dd';

export default {
  inject: ['$validator'],
  props: {
    name: { type: String, required: true },
    value: { type: String, default: null },
    format: { type: String, default: DATE_FORMAT },
    validate: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false },
    label: { type: String, default: null }
  },
  computed: {
    normalizedValue() {
      return this.normalize(this.value, this.format, DATE_FORMAT);
    },
    processedValidation() {
      const { validate, format: inputFormat } = this;
      if (!get(validate, 'before') && !get(validate, 'after')) {
        return omit(validate, ['before', 'after']);
      }
      const tmp = { ...validate, date_format: DATE_FORMAT };
      ['before', 'after'].forEach(k => {
        tmp[k] && (tmp[k] = this.normalize(tmp[k], inputFormat, DATE_FORMAT));
      });
      return tmp;
    }
  },
  methods: {
    save(value) {
      this.$emit('input', this.normalize(value, DATE_FORMAT, this.format));
    },
    normalize(value, inputFormat, outputFormat) {
      if (!value) return;
      const date = parse(value, inputFormat, new Date());
      return format(date, outputFormat);
    }
  }
};
</script>
