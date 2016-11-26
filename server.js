"use strict";
const request = require('request')
const webpackDevServer = require('koa-webpack-dev');
const app = require('koa')()
const router = require('koa-router')()
const send = require('koa-send')
const json = require('koa-json')
const microtime = require('microtime')
const io = new (require( 'koa-socket' ))();

const port = process.env.PORT || 3000

router.get('/', function *(){
  yield send(this, 'index.html', { root: __dirname })
})

router.get('/sync', function *(){
  this.body = microtime.now();
  //  this.body = this.params.original + "|" + Math.floor(microtime.now() * 1000) + "|" + Math.floor(microtime.now() * 1000);
})

io.attach(app);

app.io.on( 'join', ( ctx, data ) => {
  console.log( 'join event fired', data )
})

app._io.on( 'connection', sock => {
  console.log("hello")
})

app.use(webpackDevServer({
    config: './webpack.dev.config.js'
})).use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
	var timestamp = start.toISOString().replace(/T/, ' ').replace(/\..+/, '');
  console.log('%s [%s]: %s %s - %sms', this.request.ip, timestamp, this.method, this.url, ms);
}).use(json())
	.use(router.routes())
	.use(router.allowedMethods());

app.listen(port)
