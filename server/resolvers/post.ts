import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { getRepository } from 'typeorm';
import { Post } from '../entities/Post';
import { isAuth } from '../middleware/isAuthenticated';
import { MyContext } from '../types';

@InputType()
class PostInput {
  @Field()
  title!: string;
  @Field()
  text!: string;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string,
  ): Promise<Post[]> {
    const realLimit = Math.min(50, limit);
    const qb = getRepository(Post)
      .createQueryBuilder('postz')
      .orderBy('"createdAt"', 'DESC')
      .take(realLimit);

    if (cursor) {
      qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
    }
    return qb.getMany();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id') id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext,
  ): Promise<Post> {
    return Post.create({
      ...input,
      originalPosterId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title') title: string,
  ): Promise<Post | null> {
    const post = await Post.findOne({ where: { id } });
    if (!post) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (typeof title !== undefined) {
      await Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    try {
      await Post.delete({ id });
    } catch {
      return false;
    }

    return true;
  }
}
