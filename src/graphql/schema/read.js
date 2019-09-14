/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type Profile {
    id: ID!
    name: String
    username: String!
    first_name: String
    last_name: String
    photo: String
    cover_image: String
    site_url: String
    country_id: Int
  }

  type Read {
    id: ID!
    user: User!
    reading: Profile!
    type: Int!
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  extend type Query {
    getUserReads(user_id: ID!): [Read]!
  }

  extend type Mutation {
    readUser(user_id: ID!, reading: Int = 1): Boolean! @isAuth
  }
`;