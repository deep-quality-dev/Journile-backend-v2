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
    bookmark: Int! @isAuth
    hidden: Int! @isAuth
    report: Int! @isAuth
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
    getPublicPosts(date: Date, isLater: Boolean): [Post!]!
    getPrivatePosts(date: Date, isLater: Boolean): [Post!]! @isAuth
    getHotTopics(count: Int): [Post!]!
  }

  extend type Mutation {
    userPost(input: PostInput!): ID! @isAuth
    scraperPost(input: PostInput!): ID! @isScraperAuth
  }
`;