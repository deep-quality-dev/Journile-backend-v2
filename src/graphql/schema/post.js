/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type PostRateDetail {
    like: Int!
    dislike: Int!
    status: Int! @isAuth
  }

  type PostMediaDetail {
    images: [String!]
    videos: [String!]
  }

  type ReplyDetail {
    count: Int!
  }

  type PostBookmarkDetail {
    status: Int!
  }

  type Post {
    id: ID!
    title: String!
    description: String
    cover_image: String
    type: Int!
    original_url: String
    original_post_date: Date!
    category: Category!
    channel: Channel
    author: User
    media: PostMediaDetail!
    gamma_tags: String
    reissued_id: ID
    language: String!
    rate: PostRateDetail!
    reply: ReplyDetail!
    bookmark: PostBookmarkDetail! @isAuth
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  input PostInput {
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
  }

  extend type Query {
    getPublicPosts(date: Date, isLater: Boolean): [Post!]!
    getPrivatePosts(date: Date, isLater: Boolean): [Post!]! @isAuth
  }
`;