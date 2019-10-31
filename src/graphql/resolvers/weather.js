/* @flow */

import { UserInputError } from 'apollo-server-express';
import Sequelize from 'sequelize';
import geoip from 'geoip-lite';

import models from '../../models';
import logger from '../../middleware/logger';
import openweather from '../../middleware/openweather';

const Op = Sequelize.Op;

export default {
  Query: {
    getWeather: async (parent: any, params: any, context: any, info: any) => {
      let { unit, country_code, city_name } = params
      const { req, res } = context

      unit = (unit || 'c').toLowerCase();
      country_code = country_code || 'US';
      city_name = city_name || 'New York';

      if (!country_code || !city_name) {
        let clientip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection['socket'] ? req.connection['socket'].remoteAddress : null);
        clientip = ((clientip == null) ? 'undefined' : (clientip == '::1' ? '127.0.0.1' : clientip));
        
        let geo = geoip.lookup(clientip);
        if(geo) {
          let cityName = geo ? geo.city: 'Unknown';
          let city = await models.City.findOne({ where: { name: { [Op.like]: `%${cityName}%` } } });

          if (geo.country) {
            country_code = geo.country;
            if (city) {
              city_name = city.name;
            } else {
              logger.error(`Can't get city with name: ${cityName} in country_code; ip: ${clientip}`);
              throw new UserInputError(`Can't recognize the city`);
            }
          }
        }
      }

      let weather = await openweather.getWeather(city_name, unit);

      return {
        country_code,
        city_name,
        weather: [{
          id: weather.weather[0].id,
          main: weather.weather[0].main,
          description: weather.weather[0].description,
          icon: weather.weather[0].icon,
          date: weather.dt,
        }],
      }
    },
  },
};