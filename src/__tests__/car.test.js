import { v1 as uuidv1 } from 'uuid';
import car from '../utils/car';
import { add, sub } from '../utils/math';


describe('Check sub', () => {
    // beforeEach(() => {
    //   console.log('每次執行測試前執行哦');
    // });
  
    // afterAll(() => {
    //   console.log('所有測試結束後才看得見我');
    // });
  
    test('Check the result of 5 - 2', () => {
      expect(sub(5, 2)).not.toBe(1);
    });

    test('Check the result of 5 - 3', () => {
      expect(sub(5, 3)).toBe(2);
    });
});
describe('Check add', () => {
    test('Check the result of 5 + 2', () => {
      expect(add(5, 2)).not.toBe(1);
    });

    test('Check the result of 5 + 3', () => {
      expect(add(5, 3)).toBe(8);
    });
});


jest.mock('uuid', () => ({
  v1: jest.fn(),
}));

const getCurrentCarSpy = jest.spyOn(
  car, 'getCurrentCar',
);

describe('addProdToCar', () => {
  beforeAll(() => {
    uuidv1.mockReturnValue('9999');
  });

  test('check_add_prod', () => {
    const newCar = car.addProdToCar('apple', 3);
    expect(uuidv1).toHaveBeenCalled();
    expect(uuidv1.mock.calls.length).toBe(1);
    expect(getCurrentCarSpy).toHaveBeenCalled();
    expect(newCar).toEqual(
      [{ id: '9999', name: 'apple', count: 3 }],
    );
  });

});
