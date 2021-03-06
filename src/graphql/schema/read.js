/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
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
    isReadingUser(user_id: ID!): Int! @isAuth
    isReadingChannel(channel_id: ID!): Int! @isAuth
  }

  extend type Mutation {
    readUser(user_id: ID!, reading: Int = 1): Boolean! @isAuth
    readChannel(channel_id: ID!, reading: Int = 1): Boolean! @isAuth
  }
`;