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

## Library elements

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

Click here for more examples.

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

Click here for more examples.

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
deepcompare.CompareProperties(firstObject, secondObject);
/*
Will return: ['nested.foo', 'nested.bar']
*/
```

Click here for more examples.

## License
MIT © Dean Dumitru
