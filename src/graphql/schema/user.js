/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type Token {
    token: String!
  }
  type User {
    id: ID!
    username: String!
    first_name: String!
    last_name: String!
    email: String
    phone_number: String
    signup_type: Int!
    level: Int!
    photo: String
    cover_image: String
    site_url: String
    description: String
  }
  input SigninInput {
    login: String!
    password: String!
  }

  extend type Query {
    me: User! @isAuth
  }

  extend type Mutation {
    signin(input: SigninInput!): Token!
  }
`;