/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  input PostRateInput {
    post_id: ID!
    rate: Boolean!
  }

  extend type Mutation {
    ratePost(input: PostRateInput!): Boolean! @isAuth
  }
`;