"use strict";
const request = require('request')
const webpackDevServer = require('koa-webpack-dev');
const app = require('koa')()
const router = require('koa-router')()
const send = require('koa-send')
const json = require('koa-json')
const microtime = require('microtime')
const serve = require('koa-static')
const AccessToken = require('twilio').jwt.AccessToken
const SyncGrant = AccessToken.SyncGrant
const config = require('./config.js')

const port = process.env.PORT || 3000

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

const id = guid();

let adminId = null;

router.get('/', function *(){
  yield send(this, 'index.html', { root: __dirname })
})

router.get('/sync', function *(){
  this.body = microtime.now();
})

router.get('/token', function *() {
  let appName = 'crowdaudio';
  let clientId = this.request.query.clientId;
  let endpointId = `${appName}:${id}:${clientId}`;

  let syncGrant = new SyncGrant({
    serviceSid: config.serviceSid,
    endpointId: endpointId
  });

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  let token = new AccessToken(
    config.accountSid,
    config.apiKey,
    config.apiSecret
  );
  token.addGrant(syncGrant);
  token.identity = clientId;

  if(adminId == null) adminId == clientId;

  // Serialize the token to a JWT string and include it in a JSON response
  this.body = {
    identity: clientId,
    isAdmin: clientId == adminId,
    documentId: id,
    token: token.toJwt()
  };
});

app.use(serve('mp3'))

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
