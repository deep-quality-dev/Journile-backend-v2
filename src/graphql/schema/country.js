/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type Country {
    id: ID!
    name: String!
    country_code: String
    dial_code: Int
    cities: [City!]
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  extend type Query {
    getCountries: [Country]!
    getCountry(id: ID!): Country!
    getCountryByCode(code: String!): Country!
    getCountryByDialCode(dial_code: Int!): Country!
  }
`;