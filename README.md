# redis-pubsub-stream
[![Build Status](https://travis-ci.org/mmalecki/redis-pubsub-stream.png)](https://travis-ci.org/mmalecki/redis-pubsub-stream)

Redis Pub/Sub with streaming!

## Usage

```js
var redis = require('redis');
var RedisPubSubStream = require('redis-pubsub-stream');
var pub = redis.createClient();
var sub = redis.createClient();

var stream = new RedisPubSubStream({ pub: pub, sub: sub, channel: 'pubsub' });
stream.pipe(process.stdout);

stream.write('Hello');
stream.write(' world');
stream.write('\n');
```
