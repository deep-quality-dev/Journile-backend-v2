/* @flow */

import crypto from 'crypto';
import { stringify, parse } from 'json-buffer';

import redisClient from './redis';

const methods = [
  'findOne',
  'findAll',
  'findAndCount',
  'findAndCountAll',
  'findByPk',
  'query',
  'all',
  'min',
  'max',
  'sum',
  'count',
];

export default function generateRedisModel(model, options = {}) {
  options = {
    ttl: 600,
    ...options
  }

  async function run(cacheKey, method, ...args) {
    if (!methods.includes(method)) {
      throw new Error('Unsupported method');
    }
    if (!model[`org_${method}`]) {
      throw new Error('Unsupported Method by Sequelize model');
    }

    cacheKey += method;
    if (args && args.length > 0) {
      const hash = crypto.createHash('sha1').update(JSON.stringify(args)).digest('hex');
      cacheKey += `:${hash}`;
    }
    console.log('cacheKey', cacheKey);

    let cached;
    try {
      cached = await redisClient.getAsync(cacheKey);
    } catch (error) {
      throw new Error(`Cant get cached object from Redis ${error.message}`);
    }

    if (cached) {
      let parsed;
      try {
        parsed = parse(cached);
      } catch (error) {
        throw new Error(`Cant parse JSON of cached model's object: ${error.message}`);
      }

      try {
        let result;
        const [queryOptions] = args;

        if (queryOptions && !!queryOptions.raw) {
          result = parsed;
        } else if (parsed.rows) {
          result = {
            ...parsed,
            rows: parsed.rows.map(parsedRow => model.build(parsedRow)),
          };
        } else if (typeof parsed === 'number') {
          result = parsed;
        } else if (queryOptions) {
          const buildOptions = {
            raw: !!queryOptions.raw,
            isNewRecord: !!queryOptions.isNewRecord,
          };
          if (queryOptions.include) {
            buildOptions.include = queryOptions.include;
          }
          result = model.build(parsed, buildOptions);
        } else {
          result = model.build(parsed);
        }

        return result;
      } catch (error) {
        throw new Error(`Cant build model from cached JSON: ${error.message}`);
      }
    }

    // console.log('From DB');
    const result = await model[`org_${method}`](...args);
    let toCache;
    if (!result) {
      return result;
    } if (Array.isArray(result) || result.rows || typeof result === 'number') {
      // Array for findAll, result.rows for findAndCountAll, typeof number for count/max/sum/etc
      toCache = result;
    } else if (result.toString().includes(('[object SequelizeInstance'))) {
      toCache = result;
    } else {
      throw new Error(`Unkown result type: ${typeof result}`);
    }

    redisClient.set(cacheKey, stringify(toCache));

    if (options.ttl) {
      redisClient.expire(cacheKey, options.ttl);
    }

    return result;
  }
  
  methods.forEach(method => {
    const cacheKey = `sequelize:${model.name}:`
    model[`org_${method}`] = model[method]
    model[method] = async (...args) => run(cacheKey, method, ...args);
  })

  return model;
};