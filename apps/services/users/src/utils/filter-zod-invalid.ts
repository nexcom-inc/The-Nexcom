import { z, ZodSchema } from "zod";

/**
 * Filtre un objet en fonction des clés définies dans un schéma Zod.
 * @param obj L'objet à filtrer.
 * @param schema Le schéma Zod utilisé pour déterminer les clés valides.
 * @returns Un nouvel objet contenant uniquement les champs définis dans le schéma.
 */
export const filterObjectBySchema = <T extends ZodSchema>(
  obj: Record<string, unknown>,
  schema: T
): Partial<z.infer<T>> => {
  const shape = schema instanceof z.ZodObject ? schema.shape : {};
  const filteredObj: Partial<z.infer<T>> = {};

  Object.keys(shape).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      (filteredObj as Record<string, unknown>)[key] = obj[key];
    }
  });

  return filteredObj as z.infer<T>;
};
