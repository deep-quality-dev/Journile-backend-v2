/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type PostComment {
    id: ID!
    post: Post!
    user: User!
    content: String!
    reply_id: ID
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  input PostCommentInput {
    post_id: ID!
    content: String!
    reply_id: ID
  }

  extend type Query {
    getPostComments(post_id: ID!): [PostComment!]!
  }

  extend type Mutation {
    addPostComment(input: PostCommentInput!): Boolean! @isAuth
  }
`;