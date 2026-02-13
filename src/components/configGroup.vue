<script setup lang="ts">
//configGroup传入了一个配置列表，其为浏览器本地缓存的直接接收者，会返回出一个块
//在该块里可以自定义监视器的尺寸
//参数应该有以下数据
/*
  横分块数量
  竖分块数量
  一个数组，记录元素
  [{
  model
  read-type
  read-time
  source-id
  rember-time
  width
  height//这两者都是以块作为单位的
  top//顶边
  left//左边
  }...]
 */
import { useWindowSize } from '@vueuse/core'
import { computed, type ComputedRef } from 'vue'
import SystemObserver from './SystemObserver.vue'
const { width: PageWidth, height: PageHeight } = useWindowSize()
interface subObserver {
  model: 'lineChart' | 'number'
  readType?: string
  readTime?: number
  sourceId: number
  rememberTime?: number
  width: number
  height: number
  top: number //从0开始
  left: number
}
const props = defineProps({
  blockHeight: {
    type: Number,
    default: 3
  },
  blockWidth: {
    type: Number,
    default: 3
  },
  subObservers: {
    type: Array as () => subObserver[],
    default: () => []
  },
  gridLines: {
    type: Boolean,
    default: false
  },
  linesNum: {
    type: Number,
    default: 9
  },
  theme: {
    type: String,
    default: 'light'
  }
})
interface componentPosition {
  top: number
  left: number
  width: number
  height: number
  source: subObserver
} //这里面的是实际的像素位置
const objectsPosition: ComputedRef<componentPosition[]> = computed(() =>
  props.subObservers.map((current) => ({
    top: (PageHeight.value / props.blockHeight) * current.top,
    left: (PageWidth.value / props.blockWidth) * current.left,
    width: (PageWidth.value / props.blockWidth) * current.width,
    height: (PageHeight.value / props.blockHeight) * current.height,
    source: current
  }))
) //这是一个数组，有了这玩意就可以很好的显示子组件了
</script>

<template>
  <div class="config-group">
    <template v-for="(componentObject, index) in objectsPosition" :key="index">
      <SystemObserver
        :model="componentObject.source.model"
        :width="componentObject.width"
        :height="componentObject.height"
        :read-type="componentObject.source.readType"
        :read-time="componentObject.source.readTime"
        :source-id="componentObject.source.sourceId"
        :rember-time="componentObject.source.rememberTime"
        :theme="props.theme"
        class="absolute-object"
        :style="{
          transform: `translate(${componentObject.left}px, ${componentObject.top}px)`
        }"
        :grid-lines="props.gridLines"
        :lines-num="props.linesNum"
      />
    </template>
  </div>
</template>

<style scoped>
.config-group {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
.absolute-object {
  position: absolute;
  border: 1px solid rgb(180, 173, 241);
  transition: transform 0.6s ease;
}
</style>
