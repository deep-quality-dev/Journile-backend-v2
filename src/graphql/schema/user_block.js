/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type UserBlock {
    id: ID!
    user: User!
    block: User!
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  input UserBlockInput {
    block_id: ID!
  }

  extend type Query {
    getUserBlocks: [UserBlock!]!
    getBlockedUsers: [UserBlock!]! @isAuth
  }

  extend type Mutation {
    blockUser(input: UserBlockInput!): Boolean! @isAuth
    unblockUser(input: UserBlockInput!): Boolean! @isAuth
  }
`;