import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql } from 'graphql';
import { graphqlBodySchema } from './schema';
import { gqlSchema } from './gql.schema';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const source = request.body.query!
      // const id = request.body.variables

      const root = {
        getAllUsers: async () => {
          return await fastify.db.users.findMany()
        },
        // getUser: async (id) => {
        //   return fastify.db.users.findOne({key: "id", equals: id})
        // }
        // createUser: async ({input}) => {
        //   const user = await this.db.users.create(input)
        //   return user
        // }
      }
      if(source){
        return await graphql({
          schema: gqlSchema,
          source: String(source),
          rootValue: root,
          contextValue: fastify,
        })
      }
    }
  );
};

export default plugin;
