var util = require('util');
var Duplex = require('stream').Duplex;;

var RedisPubSubStream = module.exports = function (options) {
  if (!(this instanceof RedisPubSubStream)) {
    return new RedisPubSubStream(options);
  }

  var self = this;

  if (!options.pub && !options.sub) {
    throw new TypeError('At least one of `options.sub` or `options.pub` is required');
  }

  if (typeof options.channel !== 'string') {
    throw new TypeError('`options.channel` is required');
  }

  self.pub = options.pub;
  self.sub = options.sub;
  self.channel = options.channel;

  // Assume that we are connected when starting.
  self.connected = true;
  self._queue = [];

  if (self.pub && !self.sub) {
    self.pub.on('connect', function () {
      self.connected = true;
      self._republish();
    });
  }

  if (self.sub) {
    self.sub.subscribe(self.channel);

    self.sub.on('subscribe', function (channel) {
      if (self.channel === channel) {
        self.emit('subscribe');
      }
    });

    if (self.pub) {
      self.connected = false;
      self.sub.on('subscribe', function (channel) {
        // Assume that both `sub` and `pub` belong to the same server and that
        // when Redis fails, both clients disconnect at the same time. This
        // allows us to buffer published messages until we are subscribed again
        // which is what user expects, since he's listening on the same channel.
        if (self.channel === channel) {
          self.connected = true;
          self._republish();
        }
      });
    }

    self.sub.on('message', function (channel, message) {
      if (self.channel === channel) {
        self.push(message);
      }
    });
  }

  Duplex.call(this, options);
};
util.inherits(RedisPubSubStream, Duplex);

RedisPubSubStream.prototype._write = function (chunk, encoding, cb) {
  var self = this;

  if (!self.pub) {
    throw new Error('Cannot write to a stream with no Pub client');
  }

  if (!self.connected) {
    self._queue.push(chunk);
    cb();
    return false;
  }

  // Since streams2 seems to be waiting for the callback to call `_write` again,
  // call it early. This increases the performance.
  cb();
  self.pub.publish(self.channel, chunk, function (err) {
    if (err) {
      // TODO: figure out a way to properly handle backpressure
      self._queue.push(chunk);
      self.connected = false;
    }
  });

  return true;
};

RedisPubSubStream.prototype._republish = function () {
  var self = this;

  self._queue.forEach(function (message) {
    self.pub.publish(self.channel, message);
  });
  self._queue.length = 0;
};

RedisPubSubStream.prototype._read = function () {};
