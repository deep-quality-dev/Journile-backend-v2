/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type PostHidden {
    id: ID!
    post: Post!
    user: User!
    reason: String!
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  input PostHiddenInput {
    post_id: ID!
    reason: String!
  }

  extend type Query {
    getPostHiddens: [PostHidden!]!
    getPostHidden(id: ID!): PostHidden!
  }

  extend type Mutation {
    hidePost(input: PostHiddenInput!): Boolean! @isAuth
  }
`;