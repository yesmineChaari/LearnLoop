import {
  Injectable,
  NotFoundException,
  PipeTransform,
  ArgumentMetadata,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentExistsPipe implements PipeTransform {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async transform(value: string, _metadata: ArgumentMetadata): Promise<string> {
    const comment = await this.commentRepository.findOne({
      where: { id: value },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with id ${value} not found`);
    }
    return value;
  }
}
