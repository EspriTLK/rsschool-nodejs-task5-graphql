import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
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
      const source = request.body.query!
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

      const AppSchema = new GraphQLSchema({
        query: QueryRootType
      })
      // const root = {
      //   getAllUsers: async () => {
      //     return await this.db.users.findMany()
      //   },
      //   getAllProfiles: async () => {
      //     return await this.db.profiles.findMany()
      //   },
      //   getAllPosts: async () => {
      //     return await this.db.posts.findMany()
      //   },
      //   getAllMemberTypes: async () => {
      //     return await this.db.memberTypes.findMany()
      //   },
      //   getUser: async (obj: UserEntity, args: string, context: any, info: any) => {
      //     return this.db.users.findOne({key: "id", equals: obj.id})
      //   },
      //   createUser: async (obj: any, args: any, context: FastifyInstance) => {
      //     console.log(obj?.input?.firstName) 
          
      //     const input: UserEntity = obj.input

      //     const newUser = {
      //       firstName: input.firstName,
      //       lastName: input.lastName,
      //       email: input.email,
      //     }
          
      //     const user = await this.db.users.create(newUser)
      //     return user
      //   }
      // }
      if(source){
        return await graphql({
          // schema: gqlSchema,
          schema: AppSchema,
          source: String(source),
          // rootValue: root,
          contextValue: fastify,
          variableValues: request.body.variables
        })
      }
    }
  );
};

export default plugin;
