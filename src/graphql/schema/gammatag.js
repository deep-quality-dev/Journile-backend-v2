/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type Gammatag {
    id: ID!
    name: String!
    rate: Int!
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  extend type Query {
    getTrendingGammatags(count: Int = 10): [Gammatag]!
    getGammatag(id: ID!): Gammatag
    getGammatagByName(name: String!): Gammatag
    searchGammatag(name: String!, count: Int = 5): [Gammatag]!
  }

  extend type Mutation {
    addGammatag(name: String!): Boolean @isAuth
  }
`;