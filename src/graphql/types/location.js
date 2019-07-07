/* @flow */

import { GraphQLScalarType, Kind } from 'graphql';


const ScalarLocation = new GraphQLScalarType({
  name: 'Location',
  description: 'Scalar type of location',
  serialize(value: any) {
    return {
      latitude: value.x,
      longitude: value.y,
    };
  },
  parseValue(value: any) {
    if (!typeof value === 'object') {
      throw new TypeError('Location cannot represent non object type ' + JSON.stringify(value));
    }

    if (value && value.latitude && value.longitude) {
      return {
        x: parseFloat(value.latitude),
        y: parseFloat(value.longitude),
      };
    }
    throw new TypeError('Location should have latitude and longitude values. ' + JSON.stringify(value));
  },
  parseLiteral(ast: any) {
    if (ast.kind !== Kind.OBJECT) {
      throw new TypeError('Location cannot represent non object type ' + JSON.stringify(ast.value != null ? ast.value : null));
    }
    const value = ast.value;

    if (value && value.latitude && value.longitude) {
      return {
        x: parseFloat(value.latitude),
        y: parseFloat(value.longitude),
      };
    }
    throw new TypeError('Location should have latitude and longitude values. ' + JSON.stringify(value));
  }
});

export default ScalarLocation;