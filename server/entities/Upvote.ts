import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './Post';
import { User } from './User';

@ObjectType()
@Entity()
export class Upvote extends BaseEntity {
  @Field()
  @Column({ type: 'int' })
  value?: number;

  @Field()
  @PrimaryColumn()
  postId?: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.upvotes)
  post?: User;

  @Field()
  @PrimaryColumn()
  voterId?: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.upvotes)
  voter?: User;
}
