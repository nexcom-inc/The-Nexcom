import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

// Fonction pour formater les erreurs Zod
const formatZodError = (error: ZodError) => {
  const formattedErrors: Record<string, any> = { _errors: [] };

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!formattedErrors[path]) {
      formattedErrors[path] = { _errors: [] };
    }
    formattedErrors[path]._errors.push(err.message);
  });

  return formattedErrors;
};

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, metadata: ArgumentMetadata) {
    const parsedValue = this.schema.safeParse(value);
    if (parsedValue.success) {
      return parsedValue.data;
    }

    // Formater les erreurs Zod
    const formattedErrors = formatZodError(parsedValue.error);
    throw new BadRequestException(formattedErrors);
  }
}
