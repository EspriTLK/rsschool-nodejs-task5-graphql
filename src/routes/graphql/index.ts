import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLID, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { graphqlBodySchema } from './schema';
// import { gqlSchema } from './gql.schema';
// import { FastifyInstance } from 'fastify';

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
      const query = request.body.query
      // const id = request.body.variables
      const UserType = new GraphQLObjectType({
        name: 'User',
        fields: () => ({
          id: { type: GraphQLID },
          firstName: { type: new GraphQLNonNull(GraphQLString) },
          lastName: { type: new GraphQLNonNull(GraphQLString) },
          email: { type: new GraphQLNonNull(GraphQLString) },
          subscribedToUserIds: { type: new GraphQLList(GraphQLID) },
          // profiles: { type: new GraphQLScalarType(String) },
          // posts: { type: new GraphQLScalarType(String) },
          // memberType: { type: new GraphQLScalarType(String) },
        }),
      })

      const UserInputType = new GraphQLInputObjectType({
        name: 'UserInput',
        fields: {
          firstName: { type: new GraphQLNonNull(GraphQLString)},
          lastName: { type: new GraphQLNonNull(GraphQLString)},
          email: { type: new GraphQLNonNull(GraphQLString)},
        }
      })

      const PostType = new GraphQLObjectType({
          name: 'Post',
          fields: () => ({
            id: { type: GraphQLID },
            title: { type: new GraphQLNonNull(GraphQLString) },
            content: { type: new GraphQLNonNull(GraphQLString) },
            // args: {id: { type: GraphQLID}},
            userId: { 
              type: UserType,
              resolve: (post, args, context) => {
                return context.db.users.findOne({key: 'id', equals: args.id})
              }
            },
          }),
        })

      const QueryRootType = new GraphQLObjectType({
        name: 'UserSchema',
        fields: () => ({
          users: {
            type: new GraphQLList(UserType),
            resolve: async (obj, args, context) => {
              return await context.db.users.findMany()
            }
          },
          user: {
            type: UserType,
            args: {id: {type: GraphQLID}},
            resolve: async (id, args, context) => {
              // console.log(await context.db.users.findOne({key: 'id', equlas: args.id}))
              return await context.db.users.findOne({key: 'id', equals: args.id});
            }
          },
          posts: { 
            type: new GraphQLList(PostType),
            resolve: async ( obj, args, context ) => {
              return await context.db.posts.findMany()
            }
          }
        })
      })

      const RootMutation = new GraphQLObjectType({
        name: 'RootMutationType',
        fields: {
          createUser: {
            type: UserType,
            args: {
              data: {
                type: new GraphQLNonNull(UserInputType)
              }
            },
            resolve: async (obj, args, context) => {
              const data = {...args.data}
              return await context.db.users.create(data)
            }
          },
        }
      })

      const AppSchema = new GraphQLSchema({
        query: QueryRootType,
        mutation: RootMutation
      })
        return await graphql({
          schema: AppSchema,
          source: String(query),
          contextValue: fastify,
          variableValues: request.body.variables
        })
      }
  );
};

export default plugin;
