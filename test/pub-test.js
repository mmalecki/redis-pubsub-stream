var RedisPubSubStream = require('../');
var test = require('tap').test;
var redis = require('redis');

var pub = redis.createClient();
var sub = redis.createClient();
var CHANNEL = 'pub';
var MESSAGES = 1000;
var MESSAGE = 'Hello world!';
var stream = new RedisPubSubStream({ pub: pub, channel: CHANNEL });

sub.subscribe(CHANNEL);

test('redis-pubsub-stream/pub', function (t) {
  var i;
  var count = 0;
  var callbacks = 0;

  sub.on('message', function (channel, chunk) {
    t.equal(channel, CHANNEL);
    chunk = chunk.toString('utf8');
    t.equal(chunk, MESSAGE);
    if (++count === MESSAGES) {
      t.equal(callbacks, MESSAGES);
      t.end();
      process.exit();
    }
  });

  sub.on('subscribe', function () {
    for (i = 0; i < MESSAGES; i++) {
      stream.write(MESSAGE, function (err) {
        t.ok(!err);
        ++callbacks;
      });
    }
  });
});
