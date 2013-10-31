var redis = require('redis');
var RedisPubSubStream = require('../');
var pub = redis.createClient();
var sub = redis.createClient();

var stream = new RedisPubSubStream({ pub: pub, sub: sub, channel: 'pubsub' });
stream.pipe(process.stdout);

stream.write('Hello');
stream.write(' world');
stream.write('\n');
