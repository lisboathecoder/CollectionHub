export { list, get, create, update, remove } from './rarityModel.js';

// Também export default por compatibilidade
import * as R from './rarityModel.js';
export default {
  list: R.list,
  get: R.get,
  create: R.create,
  update: R.update,
  remove: R.remove,
};
