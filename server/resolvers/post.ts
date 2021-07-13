import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post';
import { Upvote } from '../entities/Upvote';
import { isAuth } from '../middleware/isAuthenticated';
import { MyContext } from '../types';

@InputType()
class PostInput {
  @Field()
  title!: string;
  @Field()
  text!: string;
}
@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts?: Post[];
  @Field()
  hasMore?: boolean;
}
@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    // what if the Post is smaller than 70Chars ? ... seems weird
    return root.text.slice(0, 70) + '...';
  }
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext,
  ) {
    const userId = req.session.userId;
    const isUpvote = value !== -1;
    const realValue = isUpvote ? 1 : -1;
    const voteAlready = await Upvote.findOne({
      where: { postId, voterId: userId },
    });
    if (voteAlready && voteAlready.value !== realValue) {
      getConnection().transaction(async (tm) => {
        await tm.query(
          `update upvote
          set value = $1
          where "postId" = $2 and "voterId" = $3`,
          [realValue, postId, userId],
        );
        await tm.query(
          `update post
        set points = points + $1
        where id = $2;`,
          [2 * realValue, postId],
        );
      });
    } else if (!voteAlready) {
      getConnection().transaction(async (tm) => {
        await tm.query(
          `    insert into upvote ("voterId","postId","value")
      values($1,$2,$3);`,
          [userId, postId, realValue],
        );
        await tm.query(
          `update post
        set points = points + $1
        where id = $2;`,
          [realValue, postId],
        );
      });
    }
    // getConnection().query(
    //   `START TRANSACTION;

    // COMMIT;
    // `,
    // );
    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext,
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    // Loading more than we are gonna show to check if there are more posts or we reached the end
    const realLimitPlusOne = realLimit + 1;
    // const userId = await req.session.userId;
    console.log('before:', req.session);
    const sqlReplacements: any[] = [realLimitPlusOne];
    if (req.session.userId) {
      sqlReplacements.push(req.session.userId);
    }
    if (cursor) {
      sqlReplacements.push(new Date(parseInt(cursor)));
    }
    console.log('after:', req.session.userId);
    const postsFetched = await getConnection().query(
      `
    SELECT p.*,
    json_build_object(
      'id', u.id,
      'username' , u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
       )creator,
    ${
      req.session.userId
        ? '(select value from upvote where "voterId"= $2 and "postId" = post.id)as "voteStatus"'
        : 'null as "voteStatus"'
    }
    FROM post p
    INNER JOIN public.user u ON u.id = p."creatorId"
${cursor ? `WHERE p."createdAt" < $3` : ''}
    ORDER BY p."createdAt" DESC
    LIMIT $1
    `,
      sqlReplacements,
    );
    return {
      posts: postsFetched.slice(0, realLimit),
      hasMore: postsFetched.length === realLimitPlusOne,
    };
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
      creatorId: req.session.userId,
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
