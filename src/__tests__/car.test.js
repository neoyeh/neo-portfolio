import uuid from 'uuid/v1';
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


jest.mock('uuid/v1');

const getCurrentCarSpy = jest.spyOn(
  car, 'getCurrentCar',
);

describe('addProdToCar', () => {
  beforeAll(() => {
    uuid.mockReturnValue('9999');
  });

  test('check_add_prod', () => {
    const newCar = car.addProdToCar('apple', 3);
    expect(uuid).toHaveBeenCalled();
    expect(uuid.mock.calls.length).toBe(1);
    expect(getCurrentCarSpy).toHaveBeenCalled();
    expect(newCar).toEqual(
      [{ id: '9999', name: 'apple', count: 3 }],
    );
  });

});
