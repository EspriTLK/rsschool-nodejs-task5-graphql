import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';
import { HttpError } from '@fastify/sensible/lib/httpError';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    return await this.db.posts.findMany()
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity | HttpError > {
      const id = request.params.id
      const post = await this.db.posts.findOne({key: 'id', equals: id})
      if(post) {
        return post
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
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity | HttpError> {
      const body = request.body
      return await this.db.posts.create(body)
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity | HttpError> {
      const id = request.params.id;
      const post = await this.db.posts.findOne({key: "id", equals: id})
      if(post){
        return await this.db.posts.delete(id)
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
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity | HttpError> {
      const id = request.params.id;
      const post = await this.db.posts.findOne({key: 'id', equals: id})
      const body = request.body
      const returnBody = {
        content: body.content || post?.content,
        title: body.title || post?.title
      }
      if(post){
        return await this.db.posts.change(id, returnBody)
      } else {
        reply.statusCode = 400
        return fastify.httpErrors.badRequest()
      }
    }
  );
};

export default plugin;
