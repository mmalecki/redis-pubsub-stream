var RedisPubSubStream = require('../');
var test = require('tap').test;
var redis = require('redis');

var pub = redis.createClient();
var sub = redis.createClient();
var CHANNEL = 'pubsub';
var MESSAGES = 1000;
var MESSAGE = 'Hello world!';
var stream = new RedisPubSubStream({ pub: pub, sub: sub, channel: CHANNEL });

test('redis-pubsub-stream/pub-sub', function (t) {
  var i;
  var count = 0;
  var callbacks = 0;

  stream.on('data', function (chunk) {
    chunk = chunk.toString('utf8');
    t.equal(chunk, MESSAGE);
    if (++count === MESSAGES) {
      t.equal(callbacks, MESSAGES);
      t.end();
      process.exit();
    }
  });

  for (i = 0; i < MESSAGES; i++) {
    stream.write(MESSAGE, function (err) {
      t.ok(!err);
      ++callbacks;
    });
  }
});
