import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import { HttpError } from '@fastify/sensible/lib/httpError';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    ProfileEntity[]
  > {
    return this.db.profiles.findMany()
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | HttpError> {
      const id = request.params.id;
      const profile = await this.db.profiles.findOne({key: "id", equals: id})
      if(profile) {
        return profile
      } else {
        reply.statusCode = 404;
        return fastify.httpErrors.notFound()
      }
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | HttpError> {
      const body = request.body
      const profile = await this.db.profiles.findOne({key: "userId", equals: body.userId})
      const memberType = await this.db.memberTypes.findOne({key: "id", equals: body.memberTypeId})
      
      if(body) {
        if(profile || !memberType){
          return fastify.httpErrors.badRequest()
        } else {
          return await this.db.profiles.create(body)
        }
      } else {
        reply.statusCode = 400
        return fastify.httpErrors.badRequest()
      }
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | HttpError> {
      const id = request.params.id;
      const profile = await this.db.profiles.findOne({key: "id", equals: id});
      if(profile) {
        reply.statusCode = 400
        return await this.db.profiles.delete(id)
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
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | HttpError> {
      const id = request.params.id
      const body = request.body
      const profile = await this.db.profiles.findOne({key: "id", equals: id})
      const returnBody = {
        avatar: body.avatar || profile?.avatar,
        sex: body.sex || profile?.sex,
        birthday: body.birthday || profile?.birthday,
        country: body.country || profile?.country,
        street: body.street || profile?.street,
        city: body.city || profile?.city,
        memberTypeId: body.memberTypeId || profile?.memberTypeId,
      }
      if (profile) {
        return await this.db.profiles.change(id, returnBody)
      } else {
        reply.statusCode = 400
        return fastify.httpErrors.badRequest()
      }

    }
  );
};

export default plugin;
