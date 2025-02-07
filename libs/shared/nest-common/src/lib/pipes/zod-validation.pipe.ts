
import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema  } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, metadata: ArgumentMetadata) {
      const parsedValue = this.schema.safeParse(value);
      if (parsedValue.success) {
          return parsedValue.data;
      }

      throw new BadRequestException(parsedValue.error.format());
  }
}
