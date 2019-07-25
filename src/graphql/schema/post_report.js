/* @flow */

import { gql } from 'apollo-server-express';

export default gql`
  type PostReport {
    id: ID!
    post: Post!
    user: User!
    reason: String!
    status: Int! @isAuth
    create_date: Date! @isAuth
    update_date: Date! @isAuth
  }

  input PostReportInput {
    post_id: ID!
    reason: String!
  }

  extend type Query {
    getPostReports: [PostReport!]!
    getPostReport(id: ID!): PostReport!
  }

  extend type Mutation {
    reportPost(input: PostReportInput!): Boolean! @isAuth
  }
`;