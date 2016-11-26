"use strict";
const request = require('request')
const webpackDevServer = require('koa-webpack-dev');
const app = require('koa')()
const router = require('koa-router')()
const send = require('koa-send')
const json = require('koa-json')

const port = process.env.PORT || 3000

router.get('/', function *(){
  yield send(this, 'index.html', { root: __dirname })
})

app.use(webpackDevServer({
    config: './webpack.dev.config.js'
}));

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
	var timestamp = start.toISOString().replace(/T/, ' ').replace(/\..+/, '');
  console.log('%s [%s]: %s %s - %sms', this.request.ip, timestamp, this.method, this.url, ms);
}).use(json())
	.use(router.routes())
	.use(router.allowedMethods());
app.listen(port)
