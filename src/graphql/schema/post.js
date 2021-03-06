/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type PostRateDetail {
    like: Int!
    dislike: Int!
    status: Int!
  }

  type VideoData {
    url: String! @URL
    thumb_url: String @URL
  }

  type PostMediaDetail {
    images: [String!] @URL
    videos: [VideoData!]
  }

  type ReplyDetail {
    count: Int!
  }

  type Post {
    id: ID!
    title: String!
    description: String
    cover_image: String @URL
    type: Int!
    original_url: String
    original_post_date: Date!
    category: Category!
    channel: Channel
    author: User
    media: PostMediaDetail!
    gammatags: String
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

  input VideoInput {
    url: String!
    thumb_url: String
  }

  input PostInput {
    title: String!
    description: String
    cover_image: String
    type: Int!
    original_url: String
    original_post_date: Date!
    category_id: ID!
    gammatags: [String!]!
    images: [String!]
    videos: [VideoInput!]
    reissued_id: ID
    language: String
  }

  extend type Query {
    getPosts(date: Date, isLater: Boolean): [Post!]! @checkAuth
    getHotTopics(count: Int): [Post!]!
    getUserPosts(user_id: ID!, date: Date, isLater: Boolean): [Post!]! @checkAuth
    getChannelPosts(channel_id: ID!, date: Date, isLater: Boolean): [Post!]! @checkAuth
    searchPosts(searchkey: String, offset: Int = 0): [Post!]! @checkAuth
    searchArticles(searchkey: String, offset: Int = 0): [Post!]! @checkAuth
    searchPhotos(searchkey: String, offset: Int = 0): [Post!]! @checkAuth
    searchVideos(searchkey: String, offset: Int = 0): [Post!]! @checkAuth
    searchLives(searchkey: String, offset: Int = 0): [Post!]! @checkAuth
  }

  extend type Mutation {
    userPost(input: PostInput!): ID! @isAuth
    scraperPost(input: PostInput!): ID! @isScraperAuth
  }
`;