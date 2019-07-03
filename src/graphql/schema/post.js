/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type Post {
    id: ID!
    title: String!
    description: String
    cover_image: String
    type: Int!
    original_url: String
    original_post_date: Date!
    category_id: ID!
    channel_id: ID
    author_id: ID
    gamma_tags: String
    reissued_id: ID
    language: String!
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  extend type Query {
    getPosts(date: Date, isLater: Boolean): [Post!]!
  }
`;