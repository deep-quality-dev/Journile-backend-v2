/* @flow */

import axios from 'axios';
import { stringify, parse } from 'json-buffer';

import config from '../../config';
import redisClient from '../redis';
import logger from '../logger';

class OpenWeatherAPI {
  async getWeather(city_name: string, unit: string = 'c') {
    let units = unit == 'f'? 'imperial': 'metric'; //metric = C, imperial = F, default = K
    const cacheKey = `weather:${city_name}:${units}`;

    let cached;
    try {
      cached = await redisClient.getAsync(cacheKey);
    } catch (error) {
      logger.error(`Cant get cached object from Redis ${error.message}`);
    }
    
    if (cached) {
      let parsed;
      try {
        parsed = parse(cached);
        return parsed;
      } catch (error) {
        logger.error(`Cant parse JSON of cached model's object: ${error.message}`);
      }
    }

    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city_name}&units=${units}&appid=${config.weather_api_key}&cnt=7`;

    const weather = await axios(url)
      .then( result => {
        return result.data;
      })
      .catch( err => {
        throw err;
      });
    
    if (weather) {
      redisClient.set(cacheKey, stringify(weather));
      redisClient.expire(cacheKey, 3600);
    }
    
    return weather;
  }
}

const openweather = new OpenWeatherAPI();
export default openweather;