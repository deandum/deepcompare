const objectDeepCompare  = require('src/main');

const CompareProperties = (firstObject, secondObject) => {
	if (!firstObject) { return null; }
	if (!secondObject) { return null; }
	return objectDeepCompare.CompareProperties(firstObject, secondObject);
};

const CompareArrays = (firstArray, secondArray) => {
	return objectDeepCompare.CompareArrays(firstArray, secondArray);
};

const CompareValuesWithConflicts = (firstObject, secondObject, pathOfConflict) => {
	if (!firstObject) { return null; }
	if (!secondObject) { return null; }
	if (!pathOfConflict) { pathOfConflict = ''; }
	return objectDeepCompare.CompareValuesWithConflicts(firstObject, secondObject, pathOfConflict);
};

module.exports = {
	CompareProperties,
	CompareArrays,
	CompareValuesWithConflicts
};
