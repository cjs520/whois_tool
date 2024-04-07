// src/utils/request.ts
import { extend } from 'umi-request';

// 创建一个umi-request实例
const request = extend({
  prefix: 'http://127.0.0.1:5000', // 设置请求前缀
  timeout: 10000, // 设置超时时间
  headers: {
    'Content-Type': 'application/json',
  },
  // 错误处理
  errorHandler: (error: any) => {
    // 示例：处理错误，例如展示错误提示
    console.error(error);
    return error;
  },
});

export default request;
