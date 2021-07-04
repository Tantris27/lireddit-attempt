import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
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
  posts(): Promise<Post[]> {
    return Post.find();
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
      originalPosterId: parseInt(req.session.id),
    }).save();
  }
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title') title: string,
  ): Promise<Post | null> {
    const post = await Post.findOne({ where: { id } });
    await console.log(post);
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
  // @Mutation(() => Boolean)
  // async deleteByTitlePost(
  //   @Arg('title', () => String) title: string,

  //   @Ctx() { em }: MyContext,
  // ): Promise<boolean> {
  //   try {
  //     await em.nativeDelete(Post, { title });
  //   } catch {
  //     return false;
  //   }

  //   return true;
  // }
}
