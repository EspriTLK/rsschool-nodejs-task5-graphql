import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import { HttpError } from '@fastify/sensible/lib/httpError';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    const users = await fastify.db.users.findMany()
    return  users
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | HttpError> {
      const id = request.params.id
      const user = await this.db.users.findOne({ key: "id", equals:id })
      if (user) {
        return user
      } else {
        reply.statusCode = 404
        return fastify.httpErrors.notFound()
      }
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const body = request.body
      const user = await this.db.users.create(body)
      return user
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | HttpError> {
      const id = request.params.id
      const user = await this.db.users.findOne({ key: "id", equals: id})
      const userPosts = await this.db.posts.findMany({key: "userId", equals: id})
      const userProfiles = await this.db.profiles.findMany({key: "userId", equals: id})
      const subscribedToUser = await this.db.users.findMany({ key: "subscribedToUserIds", equals: [id]})
      if(user){
        if(subscribedToUser){
          subscribedToUser.forEach(async userSubscriber => {
            userSubscriber.subscribedToUserIds.splice(userSubscriber.subscribedToUserIds.indexOf(id), 1)
            await this.db.users.change(userSubscriber.id, {subscribedToUserIds: userSubscriber.subscribedToUserIds})
            if(userProfiles){
              userProfiles.forEach(async userProfile => {
                await this.db.profiles.delete(userProfile.id)
              })
              }
            if(userPosts){
              userPosts.forEach(async userPost => {
                await this.db.posts.delete(userPost.id)
              })
            }
          })
          reply.statusCode = 404
          return await this.db.users.delete(id)
        } else {
          reply.statusCode = 404
          return fastify.httpErrors.notFound()
        }
      } else {
        reply.statusCode = 400
        return fastify.httpErrors.badRequest()
      }
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | HttpError> {
      const fromUserId = request.params.id
      const toUserId = request.body.userId
      const fromUser = await this.db.users.findOne({key: 'id', equals: fromUserId})
      const toUser = await this.db.users.findOne({key: 'id', equals: toUserId})
      if(fromUser && toUser) {
        toUser.subscribedToUserIds.push(fromUserId)
        return await this.db.users.change(toUserId, {subscribedToUserIds: toUser.subscribedToUserIds});
      } else {
        reply.statusCode = 400
        return fastify.httpErrors.notFound()
      }
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | HttpError> {
      const fromUserId = request.params.id
      const toUserId = request.body.userId
      const fromUser = await this.db.users.findOne({key: 'id', equals: fromUserId})
      const toUser = await this.db.users.findOne({key: 'id', equals: toUserId})
      if(fromUser && toUser) {
        if(toUser.subscribedToUserIds.includes(fromUserId)){
        toUser.subscribedToUserIds.splice(toUser.subscribedToUserIds.indexOf(fromUserId), 1);
        return await this.db.users.change(toUserId, {subscribedToUserIds: toUser.subscribedToUserIds})
      } else {
        return fastify.httpErrors.badRequest()
      }
      } else {
        reply.statusCode = 400
        return fastify.httpErrors.badRequest()
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | HttpError> {
      const id = request.params.id
      const body = request.body
      const user = await this.db.users.findOne({key: "id", equals: id})
      const returnBody = {
        firstName: body.firstName || user?.firstName,
        lastName: body.lastName || user?.lastName,
        email: body.email || user?.email
      }
      if(user) {
        return await this.db.users.change(id, returnBody)
        // return user
      } else {
        reply.statusCode = 400
        return fastify.httpErrors.badRequest()
      }
    }
  );
};

export default plugin;
