import Router from 'koa-router';
import fs from 'fs';
import path from 'path';
import ctrl from '../controller';

const getBuildFile = (filename: string) => {
  let filepath = path.join(__dirname, `../../dist/${filename}`);
  return filepath;
};

const router = new Router();

router.get('/api/test', ctrl.system.test);
router.get('/api/getServerTime', ctrl.system.getServerTime);

// 放在最后
// router.all("*", (ctx, next) => {
//   if (ctx.url.indexOf('/api/') === 0) {
//     ctx.status = ctx.method.toUpperCase() === 'OPTIONS' ? 204 : 404;
//     ctx.method.toUpperCase() === 'OPTIONS' && (ctx.body = 200);
//   } else {
//     try {
//       let content = fs.readFileSync(getBuildFile('index.html'), 'utf-8');
//       ctx.body = content;
//     } catch (e) {
//       console.log('获取文件失败');
//       // ctx.redirect('/');
//       ctx.status = 404;
//       ctx.body = 'Not Found';
//     }
//   }
// });

export default router;