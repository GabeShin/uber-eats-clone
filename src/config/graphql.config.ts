import { ApolloDriver } from '@nestjs/apollo';

export default {
  driver: ApolloDriver,
  autoSchemaFile: true,
  playground: true,
};
