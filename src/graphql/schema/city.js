/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type City {
    id: ID!
    name: String!
    location: Location!
    country: Country!
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  extend type Query {
    getCitiesByCountryID(country_id: ID!): [City]!
    getCitiesByCountryCode(country_code: String!): [City]!
    getCity(id: ID!): City!
    getCityByName(name: String!): City
  }
`;