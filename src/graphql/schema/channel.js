/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type Channel {
    id: ID!
    name: String!
    username: String!
    email: String
    logo: String
    cover_image: String
    site_url: String
    country_id: Int
    type: Int
    description: String
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  extend type Query {
    getChannels: [Channel]!
    getChannel(id: ID!): Channel!
  }
`;