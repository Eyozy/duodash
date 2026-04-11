export const MESSAGES = {
  LOADING: {
    DEFAULT: '正在加载数据...',
    CONNECTING: '正在连接 Duolingo API',
    PLACEHOLDER: '加载中...',
  },
  ERROR: {
    CONNECTION_FAILED: '连接失败',
    LOAD_FAILED: '加载数据失败',
    SERVER_FAILED: '连接服务器失败',
    REFRESH_FAILED: '刷新数据失败',
    RETRY_LATER: '刷新失败，请稍后重试',
    CONFIG_CHECK: '请检查环境变量中的 DUOLINGO_USERNAME 和 DUOLINGO_JWT 配置是否正确',
  },
  PLACEHOLDER: {
    NO_DATA: '暂无数据',
    UNKNOWN: '未知',
    LOADING: '加载中…',
  },
  ACTION: {
    RETRY: '重试',
  },
} as const;
