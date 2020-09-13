// 检查用户会话
import koa, { ParameterizedContext, Next } from 'koa';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import Util from "../util/util"; // 用来返回抽取的
import log4js from '../util/log4js';

const logger = log4js('tokenAuth');

let publicKey = '';

const publicKeyPath = path.join(__dirname, '../publicKey.txt');
if (fs.existsSync(publicKeyPath)) {
  publicKey = fs.readFileSync(publicKeyPath, { encoding: 'utf8' });
}

const whiteList = ['/api/test'];
const isDev = process.env.NODE_ENV === 'development';

// if (process.env.NODE_ENV === "development") {
//   whiteList.push('/api/upload');
// }

export default {
  /**
   * 用户token验证
   * @param {koa.ParameterizedContext} ctx
   * @param {() => Promise<any>} next
   */
  async auth(ctx: ParameterizedContext, next: Next) {
    if (whiteList.indexOf(ctx.url) > -1 || (ctx.url !== '/graphql' && ctx.url.indexOf('/api') !== 0)) {
      return next();
    }

    //检查cookie或者post的信息或者url查询参数或者头信息
    const token =
      ctx.cookies.get('token') ||
      ctx.request.body.token ||
      ctx.query.token ||
      ctx.headers["x-access-token"];
    if (!token) {
      return Util.resHandler(ctx, {
        isSuccess: false,
        msg: 'user token not found'
      });
    }
    // 解析 token
    try {
      const { userId } = jwt.verify(token, publicKey, { algorithms: ['RS256'], ignoreNotBefore: true }) as any;
      logger.info('[userId]', userId);
      // 传入上下文
      ctx.userId = userId;
      return next();
    } catch (e) {
      logger.error('[auth] token 解密失败', e + '');
      if ((e || {}).message === 'jwt expired') {
        return Util.resHandler(ctx, {
          isSuccess: false,
          msg: 'token 已过期'
        });
      }
      Util.resHandler(ctx, {
        isSuccess: false,
      }, 503);
    }
  },

  /**
   * 解密body
   * @param {koa.ParameterizedContext} ctx
   * @param {() => Promise<any>} next
   */
  async decodeBody (ctx: ParameterizedContext, next: Next) {
    if (ctx.url.indexOf('/api/') !== 0) {
      return next();
    }
    if (isDev) {
      return next();
    }

    const body = ctx.request.body || {};
    if (body.data) {
      try {
        const decodeData = Util.aesDecrypt(body.data);
        ctx.request.body = decodeData;
      } catch (e) {
        return Util.resHandler(ctx, {
          isSuccess: false,
          msg: 'error'
        }, 503);
      }
    }

    return next();
  }
};
