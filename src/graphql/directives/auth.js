import { gql, SchemaDirectiveVisitor } from 'apollo-server-express';

export const schema = gql`
  directive @isAuth
`;

export class IsAuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {

  }
}