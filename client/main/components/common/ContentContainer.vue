<template>
  <div class="content-container">
    <circular-progress v-if="isLoading" :height="50" :width="50" />
    <div v-else class="columns is-multiline">
      <tailor-teaching-elements
        v-for="element in container.elements"
        :key="element.id"
        :element="element"
        :class="['column', element.data.width === 6 ? 'is-6' : 'is-12']" />
    </div>
  </div>
</template>

<script>
import CircularProgress from '@/main/components/common/CircularProgress';
import TailorTeachingElements from 'tailor-teaching-elements';

export default {
  name: 'content-container',
  props: {
    getContainer: { type: Function, required: true }
  },
  data() {
    return {
      container: null,
      isLoading: true
    };
  },
  created() {
    return this.getContainer()
      .then(container => (this.container = container))
      .finally(() => (this.isLoading = false));
  },
  components: { CircularProgress, TailorTeachingElements }
};
</script>

<style lang="scss" scoped>
.content-container {
  display: flex;
  justify-content: center;
  margin: 35px 0;

  .columns {
    flex: 1;
  }

  .te-container {
    padding: 10px 0;
  }
}
</style>
