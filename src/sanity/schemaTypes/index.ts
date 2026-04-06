import { type SchemaTypeDefinition } from 'sanity'
import beverage from './beverage'
import dryGood from './dryGood'
import stockTransaction from './stockTransaction'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [beverage, dryGood, stockTransaction],
}
