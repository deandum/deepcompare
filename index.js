const deepCompare  = require('../src/main');

const CompareProperties = (firstObject, secondObject) => {
	if (!firstObject) { return null; }
	if (!secondObject) { return null; }
	return deepCompare.CompareProperties(firstObject, secondObject);
};

const CompareArrays = (firstArray, secondArray) => {
	return deepCompare.CompareArrays(firstArray, secondArray);
};

const CompareValuesWithConflicts = (firstObject, secondObject, pathOfConflict) => {
	if (!firstObject) { return null; }
	if (!secondObject) { return null; }
	if (!pathOfConflict) { pathOfConflict = ''; }
	return deepCompare.CompareValuesWithConflicts(firstObject, secondObject, pathOfConflict);
};

module.exports = {
	CompareProperties,
	CompareArrays,
	CompareValuesWithConflicts
};
