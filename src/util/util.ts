/*
 * @Author: Willie Chen
 * @LastEditors: Willie Chen
 * @Date: 2019-09-30 16:12:38
 * @LastEditTime: 2020-09-08 10:12:04
 * @Description: 工具集
 */

import koa, { ParameterizedContext } from 'koa';
import crypto from 'crypto';
import { key as secretKey } from '../config/secretKey';

const isDev = process.env.NODE_ENV === 'development';

interface IResData {
  msg?: string;
  data?: any;
  isSuccess: boolean;
}

export default {
  /**
   * 返回值处理
   * @param {koa.ParameterizedContext} ctx
   * @param {object} resData
   * @param {boolean} resData.isSuccess 
   * @param {string} [resData.msg] 自定义返回描述，默认错误是 'error', 成功是 'success'
   * @param {object} [resData.data] json数据
   * @param {number} [statusCode] 状态码，默认200
   * @param {boolean} [encrypt] 是否加密返回数据, 默认 NODE_ENV === 'development'
   */
  resHandler(ctx: ParameterizedContext, resData: IResData, statusCode = 200, encrypt = !isDev) {
    const json = {
      ...resData,
      isSuccess: resData.isSuccess,
      msg: resData.msg || (resData.isSuccess ? 'success' : 'request error'),
    };
    if (resData.isSuccess && resData.data != undefined) json.data = resData.data;

    if (encrypt && json.data) {
      json.data = this.aesEncrypt(json.data);
    }
    
    ctx.status = statusCode;
    ctx.body = json;
  },

  aesEncrypt (data: any) {
    data = JSON.stringify(data);
    const cipher = crypto.createCipheriv('aes-128-ecb', secretKey, '');
    let crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  },

  aesDecrypt (encrypted: string) {
    const decipher = crypto.createDecipheriv('aes-128-ecb', secretKey, '');
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    decrypted = JSON.parse(decrypted);
    return decrypted;
  },

  getRandomInt (min = 0, max = 10) {
    if (min - 0 !== min || max - 0 !== max || min > max) {
      return 0;
    }
    return (Math.random() * (max - min + 1) + min) | 0;
  },

  getRandomFloat (min = 0, max = 1, decimal = 2) {
    if (min - 0 !== min || max - 0 !== max || min > max) {
      return 0;
    }
    const res = Math.random() * (max - min) + min;
    return (res as any).toFixed(decimal) - 0;
  },

  createUuid () {
    return Math.random().toString(36).substring(2) + ((new Date()).getTime() + ((Math.random() * 10 | 0) << 24)).toString(36);
  },
}