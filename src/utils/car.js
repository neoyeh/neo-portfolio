// uuid's package.json exposes its main entry only through a conditional
// "exports" map ("node"/"default" conditions). eslint-import-resolver-node
// (latest available) doesn't implement "exports" map resolution, so it
// can't find this on disk and flags a false positive. Node's real resolver
// and webpack/Jest (both of which honor "exports") resolve it correctly —
// verified by this file's own passing tests and a clean `npm run build`.
// eslint-disable-next-line import/no-unresolved
import { v1 as uuidv1 } from 'uuid';

const car = {

  carContent: [],

  getCurrentCar: () => car.carContent,

  addProdToCar: (name, count) => {
    const workCar = [...car.getCurrentCar()];
    workCar.push({
      id: uuidv1(),
      name,
      count,
    });
    return workCar;
  },
};

export default car;
