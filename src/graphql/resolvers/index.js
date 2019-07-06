/* @flow */

import { GraphQLScalarType } from 'graphql';
import { GraphQLDateTime } from 'graphql-iso-date';

import categoryResolvers from './category';
import channelResolvers from './channel';
import countryResolvers from './country';
import gammatagResolvers from './gammatag';
import postResolvers from './post';
import userResolvers from './user';

const ScalarLocation = new GraphQLScalarType({
  name: 'Location',
  description: 'Scalar type of location',
  serialize(value) {
    return value
  },
  parseValue(value) {
    return {
      x: parseFlot(value.x || 0),
      y: parseFlot(value.y || 0),
    };
  },
  parseLiteral(ast) {
    console.log('parseLiteral', ast)
    switch (ast.kind) {
      // Implement your own behavior here by returning what suits your needs
      // depending on ast.kind
    }
  }
});

const customScalarResolver = {
  Date: GraphQLDateTime,
  Location: ScalarLocation
};

export default [
  customScalarResolver,
  categoryResolvers,
  channelResolvers,
  countryResolvers,
  gammatagResolvers,
  postResolvers,
  userResolvers,
];