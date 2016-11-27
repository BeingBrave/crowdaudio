"use strict";
const request = require('request')
const webpackDevServer = require('koa-webpack-dev');
const app = require('koa')()
const router = require('koa-router')()
const send = require('koa-send')
const json = require('koa-json')
//const microtime = require('microtime')
const serve = require('koa-static')
const io = new (require( 'koa-socket' ))()
const config = require('./config.js')

const port = process.env.PORT || 3000

router.get('/', function *(){
  yield send(this, 'index.html', { root: __dirname })
})

router.get('/sync', function *(){
  this.body = 0;
})

io.attach(app);

let adminId = null;
let isPlaying = null;
let nodes = {};

io.on( 'join', ( ctx, data ) => {
  nodes[data.clientId] = {
    id: data.clientId,
    type: "client",
    x: 0.5,
    y: 0.5
  };
  ctx.socket.emit('nodes', nodes);
  io.broadcast('joined', nodes[data.clientId]);

  if(adminId == null || adminId == data.clientId) {
    ctx.socket.emit('isAdmin', {admin: true});
    adminId = data.clientId;
  }

  if(isPlaying != null) {
    ctx.socket.emit('play', nodes[isPlaying]);
  }
});

io.on( 'updated', ( ctx, data ) => {
  var node = nodes[data.id];
  if(node != null) {
    node.type == data.type;
    node.x = data.x;
    node.y = data.y;
  }
  io.broadcast('updated', data);
});

io.on( 'play', ( ctx, data ) => {
  isPlaying = data.sourceId;
  var node = nodes[data.sourceId];
  io.broadcast('play', node);
});

io.on( 'stop', ( ctx, data ) => {
  isPlaying = null;
  var node = nodes[data.sourceId];
  io.broadcast('stop', node);
});

io.on( 'create_source', ( ctx, data ) => {
  nodes[data.id] = data;
  io.broadcast('joined', data);
});

app.use(serve('mp3'))
app.use(serve('images'))

app.use(webpackDevServer({
    config: './webpack.dev.config.js'
})).use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
	var timestamp = start.toISOString().replace(/T/, ' ').replace(/\..+/, '');
  //console.log('%s [%s]: %s %s - %sms', this.request.ip, timestamp, this.method, this.url, ms);
}).use(json())
	.use(router.routes())
	.use(router.allowedMethods());

app.listen(port)
