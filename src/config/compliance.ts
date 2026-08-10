/**
 * 站点合规备案信息。
 * 与官网、文档站保持一致，更新备案信息时只需修改此文件。
 */
export const hagicodeCompliance = {
  icp: {
    label: '闽ICP备2026004153号-1',
    href: 'https://beian.miit.gov.cn/',
    ariaLabel: 'ICP 备案信息，跳转工业和信息化部备案管理系统',
  },
  publicSecurity: {
    label: '闽公网安备35011102351148号',
    href: 'http://www.beian.gov.cn/portal/registerSystemInfo',
    ariaLabel: '公安备案信息，跳转全国互联网安全管理服务平台',
  },
} as const;
