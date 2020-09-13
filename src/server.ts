import koa from 'koa';
import koaStatic from 'koa-static';
import bodyparser from 'koa-body';
import path from 'path';
import loggerMiddleware from './middleware/loggerMiddleware';
import cors from './middleware/cors';
import TokenAuth from './middleware/tokenAuth';
import router from './router';
import config from './config';
import log4js from './util/log4js';

const logger = log4js('app.js');

const { auth, decodeBody } = TokenAuth;

const app = new koa();
const port = config.network.port;

// const isDev = process.env.NODE_ENV === 'development';

// 添加中间件
app.use(bodyparser({
  multipart: false, // 支持文件上传
  // formidable: {
    //   uploadDir: path.join(__dirname, '../tmp/upload'),
    //   keepExtensions: true, // 保持文件的后缀
    // }
}));
app.use(koaStatic(
  path.join(__dirname, '../dist')
));

// 跨域中间件
config.allowCors && app.use(cors);

// 解密 body
app.use(decodeBody);
// log 中间件
app.use(loggerMiddleware);

// token校验中间件
app.use(auth);

app.use(router.routes());
app.use(router.allowedMethods());

app.on('error', (err, ctx) => {
  logger.error('server error', err, ctx);
});

// const host = isDev ? '0.0.0.0' : 'localhost';

app.listen(port, () => {
  logger.info(`Server is starting at port http://localhost:${port}`);
});

export default app;