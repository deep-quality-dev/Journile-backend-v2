/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type PostRateDetail {
    like: Int!
    dislike: Int!
    status: Int!
  }

  type PostMediaDetail {
    images: [String!]
    videos: [String!]
  }

  type ReplyDetail {
    count: Int!
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
    bookmark: Int!
    hidden: Int!
    report: Int!
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  input PostInput {
    title: String!
    description: String
    cover_image: String
    type: Int!
    original_url: String
    original_post_date: Date!
    category_id: ID!
    gamma_tags: [String!]!
    images: [String!]
    videos: [String!]
    reissued_id: ID
    language: String
  }

  extend type Query {
    getPosts(date: Date, isLater: Boolean): [Post!]! @checkAuth
    getHotTopics(count: Int): [Post!]!
    getUserPosts(user_id: ID!, date: Date, isLater: Boolean): [Post!]! @checkAuth
    getChannelPosts(channel_id: ID!, date: Date, isLater: Boolean): [Post!]! @checkAuth
  }

  extend type Mutation {
    userPost(input: PostInput!): ID! @isAuth
    scraperPost(input: PostInput!): ID! @isScraperAuth
  }
`;