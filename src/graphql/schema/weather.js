/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type Weather {
    id: Int!
    main: String!
    description: String!
    icon: String!
    date: Date!
  }

  type WeatherResponse {
    country_code: String!
    city_name: String!
    weather: [Weather!]!
  }

  extend type Query {
    getWeather(unit: String, country_code: String, city_name: String): WeatherResponse!
  }
`;