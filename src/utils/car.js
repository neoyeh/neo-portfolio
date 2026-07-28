import { v1 as uuidv1 } from 'uuid';

const car = {

    carContent:[],

    getCurrentCar: () => car.carContent,

    addProdToCar: (name,count) => {
        const workCar = [...car.getCurrentCar()];
        workCar.push({
            id: uuidv1(),
            name,
            count
        });
        return workCar;
    },
};

export default car;