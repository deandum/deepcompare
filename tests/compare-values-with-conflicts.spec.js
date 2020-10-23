const deepCompare  = require('../src/main');

describe('Test CompareValuesWithConflicts method', () => {
	let firstObject;
	let secondObject;
	let conflicts;

	describe('with simple objects', () => {
		it('finds conflict', () => {
			firstObject = {
				foo: 1,
				bar: 2
			};

			secondObject = {
				foo: 2,
				bar: 2
			};

			conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
			expect(conflicts.length).toBe(1);
			expect(conflicts[0]).toBe('foo');
		});

		it('finds conflict with different amount of keys', () => {
			firstObject = {
				foo: 1,
				bar: 2,
				baz: 3
			};

			secondObject = {
				foo: 2,
				bar: 2,
				x: 0,
				y: 0
			};

			conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
			expect(conflicts.length).toBe(4);
			expect(conflicts[0]).toBe('baz');
			expect(conflicts[1]).toBe('x');
			expect(conflicts[2]).toBe('y');
			expect(conflicts[3]).toBe('foo');
		});

		it('finds conflict with different keys', () => {
			firstObject = {
				foo: 1,
				bar: 2,
				baz: 3
			};

			secondObject = {
				a: 2,
				b: 2,
				c: 0
			};

			conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
			expect(conflicts.length).toBe(3);
			expect(conflicts[0]).toBe('foo');
			expect(conflicts[1]).toBe('bar');
			expect(conflicts[2]).toBe('baz');
		});

		it('succeeds', () => {
			firstObject = {
				foo: 1,
				bar: 2
			};

			secondObject = {
				foo: 1,
				bar: 2
			};

			conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
			expect(conflicts.length).toBe(0);
		});
	});

	describe('with nested objects', () => {
		it('finds conflict', () => {
			firstObject = {
				nested: {
					foo: 1,
					bar: 2
				}
			};

			secondObject = {
				nested: {
					foo: 2,
					bar: 4
				}
			};

			conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
			expect(conflicts.length).toBe(2);
			expect(conflicts[0]).toBe('nested.foo');
			expect(conflicts[1]).toBe('nested.bar');

		});

		it('succeeds', () => {
			firstObject = {
				nested: {
					foo: 1,
					bar: 2
				}
			};

			secondObject = {
				nested: {
					foo: 1,
					bar: 2
				}
			};

			conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
			expect(conflicts.length).toBe(0);
		});
	});

	describe('with nested arrays', () => {
		it('finds conflict', () => {
			firstObject = {
				array: [
					1,
					2
				]

			};

			secondObject = {
				array: [
					2,
					4
				]
			};

			conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
			expect(conflicts.length).toBe(1);
			expect(conflicts[0]).toBe('array');
		});

		it('finds conflict with nested objects as elements', () => {
			firstObject = {
				array: [
					{
						foo: 1,
						bar: 2
					},
					{
						foo: -1,
						bar: -2
					}
				]

			};

			secondObject = {
				array: [
					{
						foo: 2,
						bar: 4
					},
					{
						foo: -1,
						bar: -2
					}
				]
			};

			conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
			expect(conflicts.length).toBe(1);
			expect(conflicts[0]).toBe('array');
		});

		it('succeeds', () => {
			firstObject = {
				array: [
					1,
					2
				]

			};

			secondObject = {
				array: [
					1,
					2
				]
			};

			conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
			expect(conflicts.length).toBe(0);
		});
	});

	describe('with all together', () => {
		it('finds conflict', () => {
			firstObject = {
				foo: 'a',
				bar: false,
				array: [
					1,
					2
				],
				array2: [
					{
						x: null,
						y: null
					}
				],
				nested: {
					x: 0,
					y: ["test"]
				}
			};

			secondObject = {
				foo: 'b',
				bar: true,
				array: [
					2,
					4
				],
				array2: [
					{
						x: 0,
						y: 0
					}
				],
				nested: {
					x: 0,
					y: ["test-2"]
				}
			};

			conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
			expect(conflicts.length).toBe(5);
			expect(conflicts[0]).toBe('foo');
			expect(conflicts[1]).toBe('bar');
			expect(conflicts[2]).toBe('array');
			expect(conflicts[3]).toBe('array2');
			expect(conflicts[4]).toBe('nested.y');
		});

		it('succeeds', () => {
			firstObject = {
				foo: 'a',
				bar: false,
				array: [
					1,
					2
				],
				array2: [
					{
						x: null,
						y: null
					}
				],
				nested: {
					x: 0,
					y: ["test"]
				}
			};

			secondObject = {
				foo: 'a',
				bar: false,
				array: [
					1,
					2
				],
				array2: [
					{
						x: null,
						y: null
					}
				],
				nested: {
					x: 0,
					y: ["test"]
				}
			};

			conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
			expect(conflicts.length).toBe(0);
		});

	});
});
