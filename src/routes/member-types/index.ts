import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';
import { HttpError } from '@fastify/sensible/lib/httpError';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    MemberTypeEntity[]
  > {
    return this.db.memberTypes.findMany()
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity | HttpError> {
      const id = request.params.id
      const memberType = await this.db.memberTypes.findOne({key: 'id', equals: id})
      if(memberType){
        return memberType
      } else {
        reply.statusCode = 404
        return fastify.httpErrors.notFound()
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity | HttpError> {
      const id = request.params.id
      const body = request.body
      const memberType = await this.db.memberTypes.findOne({key: 'id', equals: id})
      const returnBody = {
        discount: body.discount || memberType?.discount,
        monthPostsLimit: body.monthPostsLimit || memberType?.monthPostsLimit
      }
      if(memberType){
        return await this.db.memberTypes.change(id, returnBody)
      } else {
        reply.statusCode = 400
        return fastify.httpErrors.badRequest()
      }
    }
  );
};

export default plugin;
