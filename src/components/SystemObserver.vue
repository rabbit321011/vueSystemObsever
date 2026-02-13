<script setup lang="ts">
interface Point {
  x: number
  y: number
}
interface Line {
  startx: number
  starty: number
  endx: number
  endy: number
}
//输入监视名称，自动从后端抓取数据
import { autoGetInfo } from '@/netApply/getSystemInfo'
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
//拥有两个model,折线图model和数字显示model，该组件接收readTime(读取间隙),model(’number‘,'lineChart'),readType('cpuLoad','gpuLoad'...,),sourceId(读取第几个，默认为0)
const props = defineProps({
  model: {
    type: String,
    default: 'lineChart'
  },
  readTime: {
    type: Number,
    default: 1000 // 采样间隔 1s
  },
  readType: {
    type: String,
    default: 'cpuLoad'
  },
  sourceId: {
    type: Number,
    default: 0
  },
  width: {
    type: Number,
    default: 100
  },
  height: {
    type: Number,
    default: 100
  },
  remberTime: {
    type: Number,
    default: 20000 // 默认记录 20s
  },
  theme: {
    type: String,
    default: 'light'
  },
  gridLines: {
    type: Boolean,
    default: false
  },
  linesNum: {
    type: Number,
    default: 9
  }
})
let historyInfo: Point[] = [] //timeSet是距离系统启动的时间，单位ms，data是值{ timeSet: 0, data: 0 },
const historyInfoMaxLength = 1024
const textNowData = ref(-1)

const themeColors = computed(() => {
  if (props.theme === 'dark') {
    return {
      text: '#ffc300',
      gridLines: '#ffc300',
      line: '#ffffff',
      background: '#000000'
    }
  } else {
    return {
      text: '#999999',
      gridLines: '#87ceeb',
      line: '#1e3a8a',
      background: '#fffff0'
    }
  }
})

function cleanHistory() {
  //清理一半
  historyInfo = historyInfo.filter((current, index) => index % 2 === 0)
}
//const nowTimeSet: number = performance.now() //当前时间
//渲染的核心思路是获取在时间范围内的historyInfo,如果时间范围外还有数据就动态的添加一个“左断点”在左的最边缘
//const instance = getCurrentInstance()
//const apiBase = instance?.appContext.config.globalProperties.$APIRootUrl
async function getNewData() {
  console.log('被调用')
  const nowTimeSet = performance.now()
  try {
    const APIdata = await autoGetInfo(props.readType, props.sourceId)
    // const response = await fetch(apiBase + '/' + props.readTime + '/' + props.sourceId)
    // if (response.ok) throw new Error('网络错误：' + props.readType + ':' + nowTimeSet)
    // const APIdata = await response.json()
    // console.log(APIdata.value)
    //获取到了一个占比值
    if (!isNaN(nowTimeSet) && !isNaN(APIdata))
      historyInfo.push({ x: nowTimeSet, y: Number(APIdata) })
    if (historyInfo.length > historyInfoMaxLength) cleanHistory()
    //把这个值也给text
    textNowData.value = APIdata
    refreshData(nowTimeSet)
  } catch (error) {
    console.error(error)
  }
}
function refreshData(nowTime: number) {
  if (props.model === 'lineChart') {
    let drawTimeSet: Point[] = []
    //const nowTime = performance.now()
    const lastShowTime = nowTime - props.remberTime!
    drawTimeSet = historyInfo.filter((current, index) => {
      if (current.x >= lastShowTime) return true
      else if (index + 1 < historyInfo.length) return historyInfo[index + 1]!.x > lastShowTime
      return false
    })
    //目前drawTimeSet还是时间戳和高度，高度要根据svgSize的h画，还有就是svgSize的w等同于performance.now(),0等同于lastShowTime
    //现在进行换算,把x的占比算出来再乘加
    pointsForSvg.value = drawTimeSet.map((current) => {
      return {
        x: ((current.x - lastShowTime) / (nowTime - lastShowTime)) * svgSize.value.width + 0,
        y: svgSize.value.height - (current.y / 100) * svgSize.value.height
      }
    })
  } else if (props.model === 'number') {
    //这种模式不用进行额外的操作
  }
} //基于historyInfo来实现刷新数据
//const linesNum = ref(20) //默认是9
const gridLinesForSvg = computed(() => {
  //其实一共9+9条线，0和100%没线
  const tempLines: Line[] = []
  if (!props.gridLines && props.model === 'lineChart') return tempLines
  //加横的
  for (let i = 1; i <= props.linesNum; i++)
    tempLines.push({
      startx: 0,
      starty: (svgSize.value.height / props.linesNum + 1) * i,
      endx: svgSize.value.width,
      endy: (svgSize.value.height / props.linesNum + 1) * i
    })
  for (let i = 1; i <= props.linesNum; i++)
    tempLines.push({
      startx: (svgSize.value.width / props.linesNum + 1) * i,
      starty: 0,
      endx: (svgSize.value.width / props.linesNum + 1) * i,
      endy: svgSize.value.height
    })
  //console.log('outLines:')
  //console.log(tempLines)
  return tempLines
}) //经纬lines数据
const gridLinesToString = computed(() => {
  let baseString = ''
  gridLinesForSvg.value.map((aline) => {
    baseString += `M ${aline.startx} ${aline.starty} L ${aline.endx} ${aline.endy} `
  })
  //console.log(baseString)
  return baseString
})
const pointsForSvg = ref<Point[]>([
  { x: 0, y: 0 },
  { x: 0, y: 100 },
  { x: 50, y: 20 },
  { x: 270, y: 80 }
]) //原始线段数据，会被refreshData覆盖
const pointsString = computed(() => {
  return pointsForSvg.value.map((p) => `${p.x},${p.y}`).join(' ')
}) //转换
const svgSize = ref({
  width: 2048,
  height: 2048
}) //Svg原始内尺寸,其实已经没用了，别太低就行
const svgSizeString = computed(() => {
  return '0 0 ' + svgSize.value.width.toString() + ' ' + svgSize.value.height.toString()
})
let timer: number | null = null //timer是定时刷新任务
function updateTimer() {
  if (timer) clearInterval(timer)
  timer = window.setInterval(getNewData, props.readTime)
}
watch(() => props.readTime, updateTimer)
onMounted(() => {
  updateTimer()
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="system-observer-wrapper">
    <slot />
    <div
      class="main-div"
      style="display: flex; flex-wrap: wrap; gap: 16px"
      v-show="props.model === 'number'"
    >
      <!-- 这是显示文字的窗口-->
      <div
        class="main-div"
        :style="{
          color: themeColors.text,
          fontSize: '10cqw'
        }"
      >
        {{ textNowData }}%
      </div>
    </div>
    <svg
      v-show="props.model === 'lineChart'"
      :style="{ backgroundColor: themeColors.background }"
      :viewBox="svgSizeString"
      class="main-div"
      preserveAspectRatio="none"
    >
      <path :d="gridLinesToString" :stroke="themeColors.gridLines" fill="none" stroke-width="1" />
      <polyline :points="pointsString" fill="none" :stroke="themeColors.line" stroke-width="2" />
    </svg>
  </div>
</template>

<style scoped>
.system-observer-wrapper {
  width: v-bind(width + 'px');
  height: v-bind(height + 'px');
  transition: all 0.3s ease;
}
.main-div {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
