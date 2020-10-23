# deepcompare
A collection of comparison methods for objects in Javascript.

## Installation
Using npm:
```
npm install deepcompare
```

In Node.js:
```js
const deepcompare = require('deepcompare');
```

## Dependencies
- `lodash`

## Dev Dependencies
- `jest`

## Library Methods

### `CompareProperties`
This method compares the properties of two objects. It returns all the different and common properties between the two objects.
<br/>
#### Example:
```js
const firstObject = {
	foo: 1,
	bar: 2
};
const secondObject = {
	foo: 2,
};
```

```js
deepcompare.CompareProperties(firstObject, secondObject);
/*
Will return: 
{
	differences: ['bar'],
	common: ['foo]
}
*/
```

Click [here](https://github.com/deandum/deepcompare/blob/main/tests/compare-properties.spec.js) for more examples.

<hr>

### `CompareArrays`
This method compares two arrays for equality. It returns true or false.
<br>
#### Example:
```js
const firstArray = [1, 2];
const secondArray = [1, 2];
```

```js
deepcompare.CompareArrays(firstArray, secondArray);
/*
Will return: true
*/
```

Click [here](https://github.com/deandum/deepcompare/blob/main/tests/compare-arrays.spec.js) for more examples.

<hr>

### `CompareValuesWithConflicts`
This method compares the properties of two objects (deep comparison). It returns an array. Each element in the array is the path of the property that is different.
<br/>
```js
const firstObject = {
	nested: {
		foo: 1,
		bar: 2
	}
};
const secondObject = {
	nested: {
		foo: 2,
		bar: 4
	}
};
```

```js
deepcompare.CompareValuesWithConflicts(firstObject, secondObject);
/*
Will return: ['nested.foo', 'nested.bar']
*/
```

Click [here](https://github.com/deandum/deepcompare/blob/main/tests/compare-values-with-conflicts.spec.js) for more examples.

## License
MIT © Dean Dumitru
