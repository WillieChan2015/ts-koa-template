import koa, { ParameterizedContext } from 'koa';
import Util from '@util/util';

export default {
  /**
   * @param {koa.ParameterizedContext} ctx
   * @param {() => Promise<any>} next
   */
  async test (ctx: ParameterizedContext) {
    Util.resHandler(ctx, {
      isSuccess: true,
      data: {
        msg: 'ok'
      }
    });
  },

  async getServerTime (ctx: ParameterizedContext) {
    Util.resHandler(ctx, {
      isSuccess: true,
      data: Date.now()
    });
  },
}