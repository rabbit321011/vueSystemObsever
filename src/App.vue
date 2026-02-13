<script setup lang="ts">
//app.vue负责数据的写入啥的，而且编辑，弹出菜单啥的也通过app.vue中继
import configGroup from './components/configGroup.vue'
import { ref, watch, computed, onMounted, onUnmounted, h, nextTick } from 'vue'
import {
  NIcon,
  NConfigProvider,
  NLoadingBarProvider,
  NMessageProvider,
  NNotificationProvider,
  NModalProvider,
  NDialogProvider,
  NDropdown,
  useMessage,
  darkTheme
} from 'naive-ui'
interface subObserver {
  model: 'lineChart' | 'number'
  readType?: string
  readTime?: number
  sourceId: number
  rememberTime?: number
  width: number
  height: number
  top: number
  left: number
} //单个监视器
interface configData {
  objectData: subObserver[]
  blockHeight: number
  blockWidth: number
} //整体配置
function configToJSON(input: configData): string {
  return JSON.stringify(input)
}
function JSONToConfig(input: string): configData {
  return JSON.parse(input)
}
const globalState = ref({
  theme: 'light',
  gridLines: true,
  blocksLines: false,
  linesNum: 18
})
const menuOptions = computed(() => [
  {
    label: `更改模式:${globalState.value.theme}`,
    key: 'switchTheme',
    props: {
      onClick: (e: Event) => e.stopPropagation()
    }
  },
  {
    label: globalState.value.gridLines ? '关闭经纬线' : '开启经纬线',
    key: 'switchGirdLines',
    props: {
      onClick: (e: Event) => e.stopPropagation()
    }
  },
  {
    label: globalState.value.blocksLines ? '关闭辅助线' : '开启辅助线',
    key: 'switchBlocksLines',
    props: {
      onClick: (e: Event) => e.stopPropagation()
    }
  },
  {
    label: '增加经纬线',
    key: 'addGirdLines',
    props: {
      onClick: (e: Event) => e.stopPropagation()
    }
  },
  {
    label: '减少经纬线',
    key: 'decGirdLines',
    props: {
      onClick: (e: Event) => e.stopPropagation()
    }
  }
]) //菜单
const menuState = ref({
  x: 0,
  y: 0,
  show: false
})
type MenuKey =
  | 'switchTheme'
  | 'switchGirdLines'
  | 'switchBlocksLines'
  | 'addGirdLines'
  | 'decGirdLines'
const keyToFunction: Record<MenuKey, () => void> = {
  switchTheme: () => {
    globalState.value.theme = globalState.value.theme === 'light' ? 'dark' : 'light'
  },
  switchGirdLines: () => {
    globalState.value.gridLines = !globalState.value.gridLines
  },
  switchBlocksLines: () => {
    globalState.value.blocksLines = !globalState.value.blocksLines
  },
  addGirdLines: () => {
    globalState.value.linesNum++
  },
  decGirdLines: () => {
    globalState.value.linesNum--
  }
} //这里写了每个菜单选项的功能
function handleMenu(key: string) {
  if (key in keyToFunction) {
    keyToFunction[key as MenuKey]()
  }
}
function showMenu(e: MouseEvent) {
  console.log('aaa')
  e.preventDefault()
  menuState.value.show = false
  nextTick().then(() => {
    menuState.value.show = true
    menuState.value.x = e.clientX
    menuState.value.y = e.clientY
  })
} //这是个打开菜单的函数
function clickOutside() {
  menuState.value.show = false
}
//function handle//这里还没写，接下来得考虑如何编辑菜单，我设想的是在菜单没有打开的时候，拖动组件的角和边可以改变组件的大小
//然后双击菜单可以：删除被点击的组件
//：空白处可以新建组件，这个会打开一个新的UI来输入新组件的监视参数
//: 右键可以进入编辑外观页面，这里可以改写背景图片啥的
const exampleConfig: subObserver[] = [
  {
    model: 'lineChart',
    readType: 'cpuLoad',
    readTime: 500,
    sourceId: 1,
    rememberTime: 20000,
    width: 2,
    height: 1,
    top: 0,
    left: 0
  },
  {
    model: 'lineChart',
    readType: 'cpuLoad',
    readTime: 500,
    sourceId: 2,
    rememberTime: 20000,
    width: 1,
    height: 1,
    top: 0,
    left: 2
  },
  {
    model: 'lineChart',
    readType: 'cpuLoad',
    readTime: 1000,
    sourceId: 3,
    rememberTime: 10000,
    width: 1,
    height: 1,
    top: 1,
    left: 0
  },
  {
    model: 'number',
    readType: 'cpuLoad',
    readTime: 1000,
    sourceId: 4,
    rememberTime: 10000,
    width: 1,
    height: 1,
    top: 1,
    left: 1
  }
]
//const exampleConfig: subObserver[] = []
const nowConfig = ref<configData>({
  objectData: [],
  blockHeight: 3,
  blockWidth: 3
})
nowConfig.value.objectData = exampleConfig
//const baseLinesShow = ref(false) //这里定义了基线是否显示
const stringBaseLines = computed(() => {
  //获取宽高和当前的分割数来计算
  let output = ''
  for (
    let i = 1;
    i < nowConfig.value.blockHeight;
    i++ //横线
  )
    output += `M 0 ${(2048 / nowConfig.value.blockHeight) * i} L ${2048} ${(2048 / nowConfig.value.blockHeight) * i} `
  for (
    let i = 1;
    i < nowConfig.value.blockWidth;
    i++ //竖线
  )
    output += `M ${(2048 / nowConfig.value.blockWidth) * i} 0 L ${(2048 / nowConfig.value.blockWidth) * i} ${2048} `
  console.log(output)
  return output
})
</script>

<template>
  <n-config-provider :theme="globalState.theme === 'dark' ? darkTheme : null">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-notification-provider>
          <n-modal-provider>
            <n-dialog-provider>
              <!-- 这里才是真的写组件的地方-->
              <div
                @contextmenu="showMenu"
                :style="{
                  backgroundColor: globalState.theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                  minHeight: '100vh',
                  transition: 'background-color 0.3s ease'
                }"
              >
                <!--下一个SVG是辅助线-->
                <svg
                  v-show="globalState.blocksLines"
                  viewBox="0 0 2048 2048"
                  preserveAspectRatio="none"
                  width="100%"
                  height="100%"
                  style="position: absolute; top: 0; left: 0; pointer-events: none"
                >
                  <path :d="stringBaseLines" stroke="#B4ADF1" fill="none" stroke-width="2" />
                </svg>
                <config-group
                  :sub-observers="nowConfig.objectData"
                  :block-height="nowConfig.blockHeight"
                  :block-width="nowConfig.blockWidth"
                  :grid-lines="globalState.gridLines"
                  :lines-num="globalState.linesNum"
                  :theme="globalState.theme"
                />
                <n-dropdown
                  placement="bottom-start"
                  trigger="manual"
                  :x="menuState.x"
                  :y="menuState.y"
                  :options="menuOptions"
                  :show="menuState.show"
                  :close-on-select="false"
                  :on-clickoutside="clickOutside"
                  @update:show="
                    (v: boolean) => {
                      // 只有当菜单正在关闭时，才更新状态
                      // 这样可以防止点击菜单项时菜单关闭
                      if (!v) {
                        menuState.show = v
                      }
                    }
                  "
                  @select="handleMenu"
                />
              </div>
              <!--这里结束写组件-->
            </n-dialog-provider>
          </n-modal-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<style scoped></style>
