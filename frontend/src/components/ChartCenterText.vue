<template>
  <div class="chart-center-text" :style="textStyle">
    {{ text }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  text: string;
  fontSize?: string;
  color?: string;
}>();

const textStyle = computed(() => ({
  fontSize: props.fontSize || '2rem',
  color: props.color || '#F9FAFB',
}));
</script>

<style scoped>
.chart-center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 700;
  text-align: center;
  pointer-events: none;
  z-index: 3;
  opacity: 0.9;
}
</style>
