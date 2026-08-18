import * as z from 'zod';

const objectIdNamespaceSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]{1,31}$/, 'invalid ElectroCraft object ID namespace');

export const electroCraftObjectIdSchema = z
  .string()
  .regex(
    /^ec_[a-z][a-z0-9-]{1,31}_[0-9a-z]{13}$/,
    'invalid ElectroCraft object ID',
  )
  .brand<'ElectroCraftObjectId'>();

export type ElectroCraftObjectId = z.infer<typeof electroCraftObjectIdSchema>;

const FNV64_OFFSET = 0xcbf29ce484222325n;
const FNV64_PRIME = 0x100000001b3n;

export function createDeterministicObjectId(
  namespace: string,
  seed: string,
): ElectroCraftObjectId {
  const normalizedNamespace = objectIdNamespaceSchema.parse(
    namespace.trim().toLowerCase(),
  );
  const normalizedSeed = seed.normalize('NFKC').trim();
  if (!normalizedSeed) {
    throw new TypeError('ElectroCraft deterministic ID seed cannot be empty');
  }

  let hash = FNV64_OFFSET;
  const input = `${normalizedNamespace}\u0000${normalizedSeed}`;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= BigInt(input.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * FNV64_PRIME);
  }

  const encoded = hash.toString(36).padStart(13, '0');
  return electroCraftObjectIdSchema.parse(
    `ec_${normalizedNamespace}_${encoded}`,
  );
}
