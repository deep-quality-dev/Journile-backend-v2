/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type Country {
    id: ID!
    name: String!
    country_code: String
    dial_code: String
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  extend type Query {
    getCountries: [Country]!
    getCountry(id: ID!): Country!
    getCountryByCode(code: String!): Country!
  }
`;