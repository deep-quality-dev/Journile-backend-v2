/* @flow */

import redis from 'redis';
import bluebird from "bluebird";

import config from '../../config';

// make node_redis promise compatible
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient({
  host: config.redis_host,
  port: config.redis_port,
  no_ready_check: true,
  password : config.redis_pass,
});
client.on('connect', () => {
  console.log(`Connected to redis`);
});
client.on('error', err => {
  console.log(`Error: ${err}`);
});

export default client;