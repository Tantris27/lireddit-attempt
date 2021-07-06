import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './Post';
import { User } from './User';

@ObjectType()
@Entity()
export class Upvote extends BaseEntity {
  @Field()
  @PrimaryColumn()
  value?: number;

  @Field()
  @PrimaryColumn()
  postId?: number;

  @Field()
  @ManyToOne(() => Post, (post) => post.upvotes)
  post?: User;

  @Field()
  @Column()
  voterId?: number;

  @Field()
  @ManyToOne(() => User, (user) => user.upvotes)
  voter?: User;
}
