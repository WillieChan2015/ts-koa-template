import { ParameterizedContext, Next } from 'koa';
import log4js from '../util/log4js';
const logger = log4js('cors-middleware');

logger.info('===== 已允许跨域 =====');

export default async function (ctx: ParameterizedContext, next: Next) {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, DELETE');

  // 表明服务器支持的所有头信息字段
  // ctx.set('Access-Control-Allow-Headers', 'x-requested-with, accept, origin, content-type, x-access-token');
  ctx.set('Access-Control-Allow-Headers', '*');

  // Content-Type表示具体请求中的媒体类型信息
  // ctx.set('Content-Type', 'application/json;charset=utf-8');

  // 用来指定本次预检请求的有效期，单位为秒。
  // 当请求方法是PUT或DELETE等特殊方法或者Content-Type字段的类型是application/json时，服务器会提前发送一次请求进行验证
  ctx.set('Access-Control-Max-Age', 60 * 5 + '');

  return await next();
}