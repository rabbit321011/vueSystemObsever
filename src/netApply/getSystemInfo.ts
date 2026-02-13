interface HardwareResponse {
  value: number
}
const apiRoot = import.meta.env.VITE_API_ROOT_URL
export async function autoGetInfo(InfoName: string, extraNum: number): Promise<number> {
  try {
    const url = `${apiRoot}?type=${InfoName}&id=${extraNum}`
    const response = await fetch(url, {
      method: 'GET',
    })
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
    }
    // 后端返回的是 { "value": 0000 }
    const data: HardwareResponse = await response.json()
    console.log(data.value)
    return data.value
  } catch {
    console.error('网络发生错误')
    return -1
  }
}
/*
export function getLoadCpu(): number {
  //doing
  return -1
}
export function getLoadCpuGHZ(): number {
  //doing
  return -1
}
export function getGpuNum(): number {
  return -1
}
export function getLoadGpu(GPUnumber: number): number {
  //doing
  return -1
}
export function getLoadGpuPower(GPUnumber: number): number {
  //doing
  return -1
}
export function getLoadGpuGHZ(GPUnumber: number): number {
  //doing
  return -1
}
export function getLoadRam(): number {
  //doing
  return -1
}
export function getLoadVram(): number {
  //doing
  return -1
}
export function getSSDnum(): number {
  return -1
}
export function getLoadSSD(SSDnumber: number): number {
  //doing
  return -1
}
export function netWork(): number {
  return -1
}
*/
