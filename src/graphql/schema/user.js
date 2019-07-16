/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
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
    country_id: Int
    city_id: Int
    description: String
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
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

  extend type Query {
    me: User! @isAuth
  }

  extend type Mutation {
    signup(input: SignupInput!): User!
    signin(input: SigninInput!): Token!
  }
`;