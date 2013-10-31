var RedisPubSubStream = require('../');
var test = require('tap').test;
var redis = require('redis');

var pub = redis.createClient();
var sub = redis.createClient();
var CHANNEL = 'sub';
var MESSAGES = 1000;
var MESSAGE = 'Hello world!';
var stream = new RedisPubSubStream({ sub: sub, channel: CHANNEL });

test('redis-pubsub-stream/sub', function (t) {
  var i;
  var count = 0;
  var callbacks = 0;

  stream.on('data', function (chunk) {
    chunk = chunk.toString('utf8');
    t.equal(chunk, MESSAGE);
    t.equal(callbacks, MESSAGE);
    if (++count === MESSAGES) {
      t.end();
      process.exit();
    }
  });

  stream.on('subscribe', function () {
    for (i = 0; i < MESSAGES; i++) {
      pub.publish(CHANNEL, MESSAGE, function (err) {
        t.ok(!err);
        ++callbacks;
      });
    }
  });
});
