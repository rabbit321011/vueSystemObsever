import { GlobalThemeOverrides } from 'naive-ui'
//AIGC
export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    // 主色：这里选一个高级的深灰色或纯黑色，配合白色背景非常有质感
    primaryColor: '#000000',
    primaryColorHover: '#333333',
    primaryColorPressed: '#111111',
    primaryColorSuppl: '#333333',

    // 背景色：强制设为纯白
    bodyColor: '#FFFFFF',
    cardColor: '#FFFFFF',
    modalColor: '#FFFFFF',
    popoverColor: '#FFFFFF',

    // 边框与分割线：使用非常淡的灰色，营造呼吸感
    borderColor: '#EEEEEE',
    dividerColor: '#F2F2F2',

    // 文字颜色：深灰色比纯黑色更耐看
    textColor1: '#1F1F1F', // 主要文字
    textColor2: '#4B4B4B', // 次要文字

    // 圆角：既然是极简白，可以考虑稍微方正一点或极致圆润
    borderRadius: '4px'
  },
  Button: {
    // 专门针对按钮的细微调整
    fontWeight: '500'
  },
  Card: {
    // 给卡片加一点淡淡的投影，而不是生硬的边框
    boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.05)'
  }
}
