/* @flow */

import { graphqls2s } from 'graphql-s2s';

export default graphqls2s.transpileSchema(`
  type Channel {
    id: ID!
    name: String!
    username: String!
    email: String
    logo: String @URL
    cover_image: String @URL
    site_url: String
    country: Country!
    type: Int
    description: String
    status: Int! @isAuth
    create_date: Date!
    update_date: Date! @isAuth
  }
  type ChannelWithReading inherits Channel {
    reading: Int!
  }

  extend type Query {
    getChannels: [ChannelWithReading]! @checkAuth
    getHotChannels(count: Int = 9): [Channel]!
    getChannel(id: ID!): ChannelWithReading @checkAuth
    getChannelByUsername(username: String!): ChannelWithReading @checkAuth
  }
`);