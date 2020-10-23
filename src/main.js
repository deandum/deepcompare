const _ = require('lodash');

/**
 * This method compares the properties of two objects
 * It returns all the different and common properties
 *
 * @param firstObject
 * @param secondObject
 * @return {Object}
 */
// CompareProperties -
const CompareProperties = (firstObject, secondObject) => {
	let differences = [];
	let common = {};
	_.forOwn(firstObject, (value, key) => {
		if (!_.has(secondObject, key)) {
			differences.push(key);
		} else {
			common[key] = true;
		}
	});

	_.forOwn(secondObject, (value, key) => {
		if (!_.has(firstObject, key)) {
			differences.push(key);
		} else {
			common[key] = true;
		}
	});

	return {
		differences: differences,
		common: _.keys(common)
	}
};

/**
 * This method compares two arrays
 * It returns true/false
 *
 * @param firstArray
 * @param secondArray
 * @return {boolean}
 */
// CompareArrays -
const CompareArrays = (firstArray, secondArray) => {
	// check for falsy
	if (!firstArray || !secondArray) {
		return false;
	}

	// must have the same length
	if (firstArray.length !== secondArray.length) {
		return false;
	}

	let ok = true;
	// process arrays
	_.forEach(firstArray, (firstElement, index) => {
		if (_.isArray(firstElement) && _.isArray(secondArray[index])) {
			if (!CompareArrays(firstElement, secondArray[index])) {
				ok = false;
				return;
			}
		} else if (_.isObject(firstElement) && _.isObject(secondArray[index])) {
			if (JSON.stringify(firstElement) !== JSON.stringify(secondArray[index])) {
				ok = false;
				return;
			}
		} else {
			if (firstElement !== secondArray[index]) {
				ok = false;
				return;
			}
		}
	});

	return ok;
};

/**
 * This method compares the properties of two objects
 * It returns an array. Each element in the array is the path of the property that is different.
 *
 *
 * @param firstObject
 * @param secondObject
 * @param pathOfConflict - the starting path for the conflict; defaults to empty string
 * @return {boolean}
 */
// CompareValuesWithConflicts -
const CompareValuesWithConflicts = (firstObject, secondObject, pathOfConflict) => {
	let conflicts = [];

	if (_.keys(firstObject).length !== _.keys(secondObject).length) {
		let result = CompareProperties(firstObject, secondObject);
		if (result && result.differences) {
			conflicts = conflicts.concat(result.differences);
		}

		if (result && result.common) {
			firstObject = _.pick(firstObject, result.common);
			secondObject = _.pick(secondObject, result.common);
		}
	}

	_.forOwn(firstObject, (value, key) => {
		let conflictPath = pathOfConflict;
		if (_.has(firstObject, key) && _.has(secondObject, key)) {

			// process nested object
			if (_.isObject(firstObject[key]) && !_.isArray(firstObject[key])) {
				let currentPath = conflictPath;
				if (_.isEmpty(conflictPath)) {
					currentPath = key.toString();
				} else {
					currentPath += '.' + key.toString();
				}
				let foundConflicts = CompareValuesWithConflicts(firstObject[key], secondObject[key], currentPath);
				if (!_.isEmpty(foundConflicts)) {
					conflicts = conflicts.concat(foundConflicts);
				}
			}

			// process array
			else if (_.isArray(firstObject[key])) {
				if (!_.isArray(secondObject[key])) {
					if (_.isEmpty(conflictPath)) {
						conflictPath = key.toString();
					} else {
						conflictPath += '.' + key.toString();
					}
				} else {
					if (!CompareArrays(firstObject[key], secondObject[key])) {
						if (_.isEmpty(conflictPath)) {
							conflictPath = key.toString();
						} else {
							conflictPath += '.' + key.toString();
						}
					}
				}
			}

			// process simple object
			else {
				if (typeof firstObject[key] === typeof secondObject[key] && firstObject[key] !== secondObject[key]) {
					if (_.isEmpty(conflictPath)) {
						conflictPath = key.toString();
					} else {
						conflictPath += '.' + key.toString();
					}
				}
			}
		} else {
			conflicts.push(key);
		}

		// add conflict path to array if different than original path
		if (!_.isEmpty(conflictPath) && conflictPath !== pathOfConflict) {
			conflicts.push(conflictPath);
		}
	});
	return conflicts;
};

module.exports = {
	CompareProperties,
	CompareArrays,
	CompareValuesWithConflicts,
};
