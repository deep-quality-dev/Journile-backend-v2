/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type Profile {
    id: ID!
    type: Int!
    name: String
    username: String!
    first_name: String
    last_name: String
    logo: String @URL
    photo: String @URL
    cover_image: String @URL
    level: Int!
    description: String
    site_url: String
    country: Country
    reading: Int!
  }

  extend type Query {
    searchUsers(searchkey: String, offset: Int = 0): [Profile!]! @checkAuth
  }
`;