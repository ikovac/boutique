<template>
  <v-dialog
    v-model="showDialog"
    v-hotkey="{ esc: close }"
    persistent
    no-click-animation
    width="700">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" color="blue-grey" outlined>
        <v-icon>mdi-cloud-upload</v-icon>Import
      </v-btn>
    </template>
    <v-form @submit.prevent="save">
      <v-card class="pa-3">
        <v-card-title class="headline">Import Users</v-card-title>
        <v-card-text>
          <label for="userImportInput">
            <v-text-field
              ref="fileName"
              v-model="filename"
              :error-messages="vErrors.collect('file')"
              :disabled="importing"
              prepend-icon="mdi-attachment"
              label="Upload .xlsx or .csv file"
              readonly
              single-line />
            <input
              ref="fileInput"
              v-validate="inputValidation"
              @change="onFileSelected"
              id="userImportInput"
              name="file"
              type="file">
          </label>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="downloadTemplateFile" text color="blue-grey">
            Download Template
          </v-btn>
          <v-spacer />
          <v-fade-transition>
            <v-btn
              v-show="serverErrorsReport"
              @click="downloadErrorsFile"
              color="error">
              <v-icon>mdi-cloud-download</v-icon>Errors
            </v-btn>
          </v-fade-transition>
          <v-btn @click="close">Cancel</v-btn>
          <v-btn :disabled="importDisabled" color="success" type="submit">
            <span v-if="!importing">Import</span>
            <v-icon v-else>mdi-loading mdi-spin</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import api from '@/admin/api/user';
import saveAs from 'save-as';
import { withFocusTrap } from '@/common/focustrap';
import { withValidation } from '@/common/validation';

const el = vm => vm.$children[0].$refs.dialog;
const inputFormats = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/csv': 'csv'
};

export default {
  name: 'import-dialog',
  mixins: [withValidation(), withFocusTrap({ el })],
  data() {
    return {
      showDialog: false,
      importing: false,
      filename: null,
      form: null,
      serverErrorsReport: null
    };
  },
  computed: {
    importDisabled() {
      return !this.filename || this.vErrors.any() || this.importing;
    },
    inputValidation: () => ({ required: true, mimes: Object.keys(inputFormats) })
  },
  methods: {
    onFileSelected(e) {
      this.form = new FormData();
      this.resetErrors();
      const [file] = e.target.files;
      if (!file) {
        this.filename = null;
        return;
      }
      this.filename = file.name;
      return this.$validator.validateAll().then(isValid => {
        if (!isValid) return;
        this.form.append('file', file, file.name);
      });
    },
    close() {
      if (this.importing) return;
      this.filename = null;
      this.$refs.fileInput.value = null;
      this.resetErrors();
      this.showDialog = false;
    },
    save() {
      this.importing = true;
      return api.bulkImport(this.form).then(({ data, count }) => {
        this.importing = false;
        if (count) this.$emit('imported');
        if (!data.size) return this.close();
        this.$nextTick(() => this.$refs.fileName.focus());
        this.vErrors.add({
          field: 'file',
          msg: `${count} users were successfully imported.`
        });
        this.serverErrorsReport = data;
      }).catch(err => {
        this.importing = false;
        this.vErrors.add({ field: 'file', msg: 'Importing users failed.' });
        this.$nextTick(() => this.$refs.fileName.focus());
        return Promise.reject(err);
      });
    },
    downloadErrorsFile() {
      const extension = inputFormats[this.serverErrorsReport.type];
      saveAs(this.serverErrorsReport, `Errors.${extension}`);
      this.$refs.fileName.focus();
    },
    downloadTemplateFile() {
      return api.getImportTemplate().then(response => {
        saveAs(response.data, 'Template.xlsx');
        this.$refs.fileName.focus();
      });
    },
    resetErrors() {
      this.serverErrorsReport = null;
      this.vErrors.clear();
    }
  },
  watch: {
    showDialog(val) {
      this.$nextTick(() => this.focusTrap.toggle(val));
    }
  }
};
</script>

<style lang="scss" scoped>
.v-form input {
  display: none;
}

.v-btn .v-icon {
  padding-right: 6px;
}

.v-text-field {
  ::v-deep .v-text-field__slot {
    cursor: pointer;

    input {
      pointer-events: none;
    }
  }

  ::v-deep {
    .mdi {
      transform: rotate(-90deg);
    }
  }
}

.v-card__actions {
  margin-top: 20px;
}
</style>
