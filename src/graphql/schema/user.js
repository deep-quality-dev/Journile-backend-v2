/* @flow */

import { graphqls2s } from 'graphql-s2s';

export default graphqls2s.transpileSchema(`
  type Token {
    token: String!
    refresh_token: String!
  }
  type User {
    id: ID!
    username: String!
    first_name: String!
    last_name: String!
    email: String
    phone_number: String @isAuth
    signup_type: Int! @isAuth
    level: Int!
    photo: String
    cover_image: String
    site_url: String
    country: Country
    city: City
    description: String
    status: Int! @isAuth
    create_date: Date!
    update_date: Date! @isAuth
  }
  type UserActivity {
    posts: Int!
    reading: Int!
    readers: Int!
    comments: Int!
    like: Int!
    dislike: Int!
    reissue: Int!
  }
  type UserWithReading inherits User {
    reading: Int!
  }

  input SignupInput {
    email: String
    password: String!
    username: String!
    first_name: String!
    last_name: String!
    phone_number: String
  }
  input SigninInput {
    login: String!
    password: String!
  }
  input ActivateInput {
    email: String!
    code: String!
  }

  extend type Query {
    me: User! @isAuth
    getUserByUsername(username: String!): User
    getUserActivity(username: String!): UserActivity
    getUserReading(user_id: ID!, offset: Int = 0): [UserWithReading]! @checkAuth
    getUserReaders(user_id: ID!, offset: Int = 0): [UserWithReading]! @checkAuth
  }

  extend type Mutation {
    signup(input: SignupInput!): User!
    signin(input: SigninInput!): Token!
    activate(input: ActivateInput!): Boolean!
    requestActivation(email: String!): Boolean!
  }
`);