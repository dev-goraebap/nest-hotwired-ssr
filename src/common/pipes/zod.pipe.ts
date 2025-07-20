import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { z, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodType<any, any>) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    try {
      const objectToValidate = value?.document || value; // 요청 본문 구조에 따라 조정
      const parsedValue = this.schema.parse(objectToValidate);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ');
        throw new BadRequestException(errorMessages);
      }
      throw new BadRequestException(
        'Validation failed due to an unexpected error.',
      );
    }
  }
}
