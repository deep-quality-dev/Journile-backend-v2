/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type Bookmark {
    id: ID!
    post: Post!
    user: User!
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  input BookmarkInput {
    post_id: ID!
    enable: Boolean!
  }

  extend type Query {
    getBookmarks: [Bookmark!]!
    getBookmark(id: ID!): Bookmark
  }

  extend type Mutation {
    bookmarkPost(input: BookmarkInput!): Boolean! @isAuth
  }
`;