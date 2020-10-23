const deepCompare  = require('../src/main');

describe('Test CompareArrays method', () => {
	let firstArray;
	let secondArray;

	describe('when falsy', () => {
		it ('returns false', () => {
			expect(deepCompare.CompareArrays(null, null)).toBe(false);
			expect(deepCompare.CompareArrays([], null)).toBe(false);
			expect(deepCompare.CompareArrays(null, [])).toBe(false);
		})
	});

	describe('with different length', () => {
		it ('returns false', () => {
			firstArray = [];
			secondArray = [1];

			expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);

			firstArray = [1];
			secondArray = [];

			expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false)
		});
	});

	describe('with same length', () => {
		it('returns false with simple array', () => {
			firstArray = [1, 2];
			secondArray = [2, 3];

			expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);
		});

		it('returns false with nested arrays', () =>{
			firstArray = [1, [1, 2]];
			secondArray = [2, [2, 3]];

			expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);

			firstArray = [1, {foo:1}];
			secondArray = [2, {bar:1}];

			expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);

			firstArray = [1, {foo:1}];
			secondArray = [1, {foo:2}];

			expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);
		});

		it('succeeds', () => {
			firstArray = [1, 2];
			secondArray = [1, 2];

			expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(true);

			firstArray = [1, ['a', 'b']];
			secondArray = [1, ['a', 'b']];

			expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(true);

			firstArray = [1, {foo: true}];
			secondArray = [1, {foo: true}];

			expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(true);
		});
	});
});
