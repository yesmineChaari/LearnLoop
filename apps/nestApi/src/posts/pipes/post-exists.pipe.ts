import {
  Injectable,
  NotFoundException,
  PipeTransform,
  ArgumentMetadata,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';

@Injectable()
export class PostExistsPipe implements PipeTransform {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async transform(value: string, _metadata: ArgumentMetadata): Promise<string> {
    const post = await this.postRepository.findOne({ where: { id: value } });
    if (!post) {
      throw new NotFoundException(`Post with id ${value} not found`);
    }
    return value;
  }
}
