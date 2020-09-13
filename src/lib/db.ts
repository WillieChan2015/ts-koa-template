import mysql, { PoolConnection } from "mysql";
import config from '../config';
import log4js from '../util/log4js';
const logger = log4js('db.js');

const pool = mysql.createPool(config.database);
logger.info("数据库环境", config.database);

export default {
  /**
   * 单次数据库 meta_config_center 连接
   * @param {object} data
   * @param {String} data.query - 数据库语句 变量传'?' 防止mysql注入
   * @param {Array} data.params - 变量数组
   * @return {Promise} - 结果的Promise
   */
  createQuery: ({ query, params }: { query: string, params: any[] }): Promise<any> => {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          logger.error("创建connection出错", err);
          return reject(err);
        }
        connection.query(query, params, (err, rows) => {
          connection.release();
          if (err) {
            logger.error("数据库操作出错", err);
            return reject(err);
          }
          logger.debug({ query, params }, "数据库操作成功");
          // logger.debug(rows);
          return resolve(rows);
        });
      });
    });
  },

  /**
   * 从连接池获取一次connection
   * @returns {mysql.PoolConnection} connection的Promise
   */
  getConnectionFromPool (): Promise<PoolConnection> {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          logger.error('获取connection失败',err);
          return reject(err);
        }
        logger.debug('获取connection成功');
        return resolve(connection);
      });
    });
  },

  /**
   * 开启一个数据库事务
   * @param {mysql.PoolConnection} connection - 事务的connection
   * @returns {mysql.PoolConnection}
   */
  beginTransaction(connection: PoolConnection): Promise<PoolConnection> {
    return new Promise((reslove, reject) => {
      connection.beginTransaction(err => {
        if (err) {
          logger.error('数据库事务创建失败: ', err);
          return reject(err);
        }
        logger.debug('数据库事务创建成功');
        return reslove(connection);
      });
    });
  },

  /**
   * 通过一个数据库事务
   * @param {mysql.PoolConnection} connection - 事务的connection
   * @returns {Promise} - 结果的Promise
   */
  connectionCommit(connection: PoolConnection): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        connection.commit(err => { 
          if (err) { 
            logger.error('commit失败: ', err);
            return this.connectionRollback(connection);
          }
          connection.release();
          return resolve();
        });
      } catch (e) {
        logger.error('commit catch error: ', e);
        connection.release();
        return reject(e);
      }
    });
  },

  /**
   * 回滚事务
   * @param {mysql.PoolConnection} connection - 事务的connection
   * @returns {Promise} - 结果的Promise
   */
  connectionRollback(connection: PoolConnection): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        connection.rollback((err) => {
          if (err) {
            logger.error('数据库回滚事务失败: ', err);
            connection.release();
            return reject(err);
          }
          logger.debug('rollback成功');
          connection.release();
          return resolve();
        });
      } catch (e) {
        logger.error('rollback catch error: ', e);
        connection.release();
        return reject(e);
      }
    });
  },

  /**
   * 创建一次数据库请求
   * @param {Object} config
   * @param {mysql.PoolConnection} config.connection
   * @param {String} config.query - 数据库语句 变量传'?' 防止mysql注入
   * @param {Array} config.params - 变量数组
   * @returns {Promise<any>} - 结果的Promise
   */
  connectionQuery({query, params, connection}: { query: string, params: any[], connection: PoolConnection }): Promise<any> {
    return new Promise((resolve, reject) => {
      connection.query(query, params, (err, rows) => {
        if (err) {
          logger.error('数据库操作出错', err);
          return reject(err)
        }
        logger.debug({query, params} ,'数据库操作成功');
        return resolve(rows);
      });
    });
  },
};
