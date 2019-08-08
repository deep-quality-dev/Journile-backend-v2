/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type Scraper {
    id: ID!
    username: String!
    channel_id: Int!
    status: Int!
    create_date: Date!
    update_date: Date!
  }
  input ScraperSigninInput {
    username: String!
    password: String!
  }

  extend type Mutation {
    scraperSignin(input: ScraperSigninInput!): String!
  }
`;