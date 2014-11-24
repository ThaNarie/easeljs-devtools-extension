var allDescriptors = [];
var applicationDescriptor;

var runtime;
var ArrayLike;
Object.isEmpty = function(obj)
{
	for (var i in obj)
		return false;
	return true;
}
Object.values = function(obj)
{
	var result = Object.keys(obj);
	var length = result.length;
	for (var i = 0; i < length; ++i)
		result[i] = obj[result[i]];
	return result;
}
function mod(m, n)
{
	return ((m % n) + n) % n;
}
String.prototype.findAll = function(string)
{
	var matches = [];
	var i = this.indexOf(string);
	while (i !== -1) {
		matches.push(i);
		i = this.indexOf(string, i + string.length);
	}
	return matches;
}
String.prototype.lineEndings = function()
{
	if (!this._lineEndings) {
		this._lineEndings = this.findAll("\n");
		this._lineEndings.push(this.length);
	}
	return this._lineEndings;
}
String.prototype.lineCount = function()
{
	var lineEndings = this.lineEndings();
	return lineEndings.length;
}
String.prototype.lineAt = function(lineNumber)
{
	var lineEndings = this.lineEndings();
	var lineStart = lineNumber > 0 ? lineEndings[lineNumber - 1] + 1 : 0;
	var lineEnd = lineEndings[lineNumber];
	var lineContent = this.substring(lineStart, lineEnd);
	if (lineContent.length > 0 && lineContent.charAt(lineContent.length - 1) === "\r")
		lineContent = lineContent.substring(0, lineContent.length - 1);
	return lineContent;
}
String.prototype.escapeCharacters = function(chars)
{
	var foundChar = false;
	for (var i = 0; i < chars.length; ++i) {
		if (this.indexOf(chars.charAt(i)) !== -1) {
			foundChar = true;
			break;
		}
	}
	if (!foundChar)
		return String(this);
	var result = "";
	for (var i = 0; i < this.length; ++i) {
		if (chars.indexOf(this.charAt(i)) !== -1)
			result += "\\";
		result += this.charAt(i);
	}
	return result;
}
String.regexSpecialCharacters = function()
{
	return "^[]{}()\\.^$*+?|-,";
}
String.prototype.escapeForRegExp = function()
{
	return this.escapeCharacters(String.regexSpecialCharacters());
}
String.prototype.escapeHTML = function()
{
	return this.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
String.prototype.unescapeHTML = function()
{
	return this.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#58;/g, ":").replace(/&quot;/g, "\"").replace(/&#60;/g, "<").replace(/&#62;/g, ">").replace(/&amp;/g, "&");
}
String.prototype.collapseWhitespace = function()
{
	return this.replace(/[\s\xA0]+/g, " ");
}
String.prototype.trimMiddle = function(maxLength)
{
	if (this.length <= maxLength)
		return String(this);
	var leftHalf = maxLength >> 1;
	var rightHalf = maxLength - leftHalf - 1;
	return this.substr(0, leftHalf) + "\u2026" + this.substr(this.length - rightHalf, rightHalf);
}
String.prototype.trimEnd = function(maxLength)
{
	if (this.length <= maxLength)
		return String(this);
	return this.substr(0, maxLength - 1) + "\u2026";
}
String.prototype.trimURL = function(baseURLDomain)
{
	var result = this.replace(/^(https|http|file):\/\//i, "");
	if (baseURLDomain)
		result = result.replace(new RegExp("^" + baseURLDomain.escapeForRegExp(), "i"), "");
	return result;
}
String.prototype.toTitleCase = function()
{
	return this.substring(0, 1).toUpperCase() + this.substring(1);
}
String.prototype.compareTo = function(other)
{
	if (this > other)
		return 1;
	if (this < other)
		return -1;
	return 0;
}
function sanitizeHref(href)
{
	return href && href.trim().toLowerCase().startsWith("javascript:") ? null : href;
}
String.prototype.removeURLFragment = function()
{
	var fragmentIndex = this.indexOf("#");
	if (fragmentIndex == -1)
		fragmentIndex = this.length;
	return this.substring(0, fragmentIndex);
}
String.prototype.startsWith = function(substring)
{
	return !this.lastIndexOf(substring, 0);
}
String.prototype.endsWith = function(substring)
{
	return this.indexOf(substring, this.length - substring.length) !== -1;
}
String.prototype.hashCode = function()
{
	var result = 0;
	for (var i = 0; i < this.length; ++i)
		result = (result * 3 + this.charCodeAt(i)) | 0;
	return result;
}
String.prototype.isDigitAt = function(index)
{
	var c = this.charCodeAt(index);
	return 48 <= c && c <= 57;
}
String.naturalOrderComparator = function(a, b)
{
	var chunk = /^\d+|^\D+/;
	var chunka, chunkb, anum, bnum;
	while (1) {
		if (a) {
			if (!b)
				return 1;
		} else {
			if (b)
				return -1;
			else
				return 0;
		}
		chunka = a.match(chunk)[0];
		chunkb = b.match(chunk)[0];
		anum = !isNaN(chunka);
		bnum = !isNaN(chunkb);
		if (anum && !bnum)
			return -1;
		if (bnum && !anum)
			return 1;
		if (anum && bnum) {
			var diff = chunka - chunkb;
			if (diff)
				return diff;
			if (chunka.length !== chunkb.length) {
				if (!+chunka && !+chunkb)
					return chunka.length - chunkb.length;
				else
					return chunkb.length - chunka.length;
			}
		} else if (chunka !== chunkb)
			return (chunka < chunkb) ? -1 : 1;
		a = a.substring(chunka.length);
		b = b.substring(chunkb.length);
	}
}
Number.constrain = function(num, min, max)
{
	if (num < min)
		num = min;
	else if (num > max)
		num = max;
	return num;
}
Number.gcd = function(a, b)
{
	if (b === 0)
		return a;
	else
		return Number.gcd(b, a % b);
}
Number.toFixedIfFloating = function(value)
{
	if (!value || isNaN(value))
		return value;
	var number = Number(value);
	return number % 1 ? number.toFixed(3) : String(number);
}
Date.prototype.toISO8601Compact = function()
{
	function leadZero(x)
	{
		return (x > 9 ? "" : "0") + x;
	}
	return this.getFullYear() +
		leadZero(this.getMonth() + 1) +
		leadZero(this.getDate()) + "T" +
		leadZero(this.getHours()) +
		leadZero(this.getMinutes()) +
		leadZero(this.getSeconds());
}
Date.prototype.toConsoleTime = function()
{
	function leadZero2(x)
	{
		return (x > 9 ? "" : "0") + x;
	}
	function leadZero3(x)
	{
		return (Array(4 - x.toString().length)).join('0') + x;
	}
	return this.getFullYear() + "-" +
		leadZero2(this.getMonth() + 1) + "-" +
		leadZero2(this.getDate()) + " " +
		leadZero2(this.getHours()) + ":" +
		leadZero2(this.getMinutes()) + ":" +
		leadZero2(this.getSeconds()) + "." +
		leadZero3(this.getMilliseconds());
}
Object.defineProperty(Array.prototype, "remove", {value: function(value, firstOnly)
{
	var index = this.indexOf(value);
	if (index === -1)
		return;
	if (firstOnly) {
		this.splice(index, 1);
		return;
	}
	for (var i = index + 1, n = this.length; i < n; ++i) {
		if (this[i] !== value)
			this[index++] = this[i];
	}
	this.length = index;
}});
Object.defineProperty(Array.prototype, "keySet", {value: function()
{
	var keys = {};
	for (var i = 0; i < this.length; ++i)
		keys[this[i]] = true;
	return keys;
}});
Object.defineProperty(Array.prototype, "pushAll", {value: function(array)
{
	Array.prototype.push.apply(this, array);
}});
Object.defineProperty(Array.prototype, "rotate", {value: function(index)
{
	var result = [];
	for (var i = index; i < index + this.length; ++i)
		result.push(this[i % this.length]);
	return result;
}});
Object.defineProperty(Array.prototype, "sortNumbers", {value: function()
{
	function numericComparator(a, b)
	{
		return a - b;
	}
	this.sort(numericComparator);
}});
Object.defineProperty(Uint32Array.prototype, "sort", {value: Array.prototype.sort});
(function() {
	var partition = {value: function(comparator, left, right, pivotIndex)
	{
		function swap(array, i1, i2)
		{
			var temp = array[i1];
			array[i1] = array[i2];
			array[i2] = temp;
		}
		var pivotValue = this[pivotIndex];
		swap(this, right, pivotIndex);
		var storeIndex = left;
		for (var i = left; i < right; ++i) {
			if (comparator(this[i], pivotValue) < 0) {
				swap(this, storeIndex, i);
				++storeIndex;
			}
		}
		swap(this, right, storeIndex);
		return storeIndex;
	}};
	Object.defineProperty(Array.prototype, "partition", partition);
	Object.defineProperty(Uint32Array.prototype, "partition", partition);
	var sortRange = {value: function(comparator, leftBound, rightBound, sortWindowLeft, sortWindowRight)
	{
		function quickSortRange(array, comparator, left, right, sortWindowLeft, sortWindowRight)
		{
			if (right <= left)
				return;
			var pivotIndex = Math.floor(Math.random() * (right - left)) + left;
			var pivotNewIndex = array.partition(comparator, left, right, pivotIndex);
			if (sortWindowLeft < pivotNewIndex)
				quickSortRange(array, comparator, left, pivotNewIndex - 1, sortWindowLeft, sortWindowRight);
			if (pivotNewIndex < sortWindowRight)
				quickSortRange(array, comparator, pivotNewIndex + 1, right, sortWindowLeft, sortWindowRight);
		}
		if (leftBound === 0 && rightBound === (this.length - 1) && sortWindowLeft === 0 && sortWindowRight >= rightBound)
			this.sort(comparator);
		else
			quickSortRange(this, comparator, leftBound, rightBound, sortWindowLeft, sortWindowRight);
		return this;
	}}
	Object.defineProperty(Array.prototype, "sortRange", sortRange);
	Object.defineProperty(Uint32Array.prototype, "sortRange", sortRange);
})();
Object.defineProperty(Array.prototype, "stableSort", {value: function(comparator)
{
	function defaultComparator(a, b)
	{
		return a < b ? -1 : (a > b ? 1 : 0);
	}
	comparator = comparator || defaultComparator;
	var indices = new Array(this.length);
	for (var i = 0; i < this.length; ++i)
		indices[i] = i;
	var self = this;
	function indexComparator(a, b)
	{
		var result = comparator(self[a], self[b]);
		return result ? result : a - b;
	}
	indices.sort(indexComparator);
	for (var i = 0; i < this.length; ++i) {
		if (indices[i] < 0 || i === indices[i])
			continue;
		var cyclical = i;
		var saved = this[i];
		while (true) {
			var next = indices[cyclical];
			indices[cyclical] = -1;
			if (next === i) {
				this[cyclical] = saved;
				break;
			} else {
				this[cyclical] = this[next];
				cyclical = next;
			}
		}
	}
	return this;
}});
Object.defineProperty(Array.prototype, "qselect", {value: function(k, comparator)
{
	if (k < 0 || k >= this.length)
		return;
	if (!comparator)
		comparator = function(a, b) {
			return a - b;
		}
	var low = 0;
	var high = this.length - 1;
	for (; ; ) {
		var pivotPosition = this.partition(comparator, low, high, Math.floor((high + low) / 2));
		if (pivotPosition === k)
			return this[k];
		else if (pivotPosition > k)
			high = pivotPosition - 1;
		else
			low = pivotPosition + 1;
	}
}});
Object.defineProperty(Array.prototype, "lowerBound", {value: function(object, comparator, left, right)
{
	function defaultComparator(a, b)
	{
		return a < b ? -1 : (a > b ? 1 : 0);
	}
	comparator = comparator || defaultComparator;
	var l = left || 0;
	var r = right !== undefined ? right : this.length;
	while (l < r) {
		var m = (l + r) >> 1;
		if (comparator(object, this[m]) > 0)
			l = m + 1;
		else
			r = m;
	}
	return r;
}});
Object.defineProperty(Array.prototype, "upperBound", {value: function(object, comparator, left, right)
{
	function defaultComparator(a, b)
	{
		return a < b ? -1 : (a > b ? 1 : 0);
	}
	comparator = comparator || defaultComparator;
	var l = left || 0;
	var r = right !== undefined ? right : this.length;
	while (l < r) {
		var m = (l + r) >> 1;
		if (comparator(object, this[m]) >= 0)
			l = m + 1;
		else
			r = m;
	}
	return r;
}});
Object.defineProperty(Uint32Array.prototype, "lowerBound", {value: Array.prototype.lowerBound});
Object.defineProperty(Uint32Array.prototype, "upperBound", {value: Array.prototype.upperBound});
Object.defineProperty(Float64Array.prototype, "lowerBound", {value: Array.prototype.lowerBound});
Object.defineProperty(Array.prototype, "binaryIndexOf", {value: function(value, comparator)
{
	var index = this.lowerBound(value, comparator);
	return index < this.length && comparator(value, this[index]) === 0 ? index : -1;
}});
Object.defineProperty(Array.prototype, "select", {value: function(field)
{
	var result = new Array(this.length);
	for (var i = 0; i < this.length; ++i)
		result[i] = this[i][field];
	return result;
}});
Object.defineProperty(Array.prototype, "peekLast", {value: function()
{
	return this[this.length - 1];
}});
(function() {
	function mergeOrIntersect(array1, array2, comparator, mergeNotIntersect)
	{
		var result = [];
		var i = 0;
		var j = 0;
		while (i < array1.length && j < array2.length) {
			var compareValue = comparator(array1[i], array2[j]);
			if (mergeNotIntersect || !compareValue)
				result.push(compareValue <= 0 ? array1[i] : array2[j]);
			if (compareValue <= 0)
				i++;
			if (compareValue >= 0)
				j++;
		}
		if (mergeNotIntersect) {
			while (i < array1.length)
				result.push(array1[i++]);
			while (j < array2.length)
				result.push(array2[j++]);
		}
		return result;
	}
	Object.defineProperty(Array.prototype, "intersectOrdered", {value: function(array, comparator)
	{
		return mergeOrIntersect(this, array, comparator, false);
	}});
	Object.defineProperty(Array.prototype, "mergeOrdered", {value: function(array, comparator)
	{
		return mergeOrIntersect(this, array, comparator, true);
	}});
}());
function insertionIndexForObjectInListSortedByFunction(object, list, comparator, insertionIndexAfter)
{
	if (insertionIndexAfter)
		return list.upperBound(object, comparator);
	else
		return list.lowerBound(object, comparator);
}
String.sprintf = function(format, var_arg)
{
	return String.vsprintf(format, Array.prototype.slice.call(arguments, 1));
}
String.tokenizeFormatString = function(format, formatters)
{
	var tokens = [];
	var substitutionIndex = 0;
	function addStringToken(str)
	{
		tokens.push({type: "string",value: str});
	}
	function addSpecifierToken(specifier, precision, substitutionIndex)
	{
		tokens.push({type: "specifier",specifier: specifier,precision: precision,substitutionIndex: substitutionIndex});
	}
	var index = 0;
	for (var precentIndex = format.indexOf("%", index); precentIndex !== -1; precentIndex = format.indexOf("%", index)) {
		addStringToken(format.substring(index, precentIndex));
		index = precentIndex + 1;
		if (format[index] === "%") {
			addStringToken("%");
			++index;
			continue;
		}
		if (format.isDigitAt(index)) {
			var number = parseInt(format.substring(index), 10);
			while (format.isDigitAt(index))
				++index;
			if (number > 0 && format[index] === "$") {
				substitutionIndex = (number - 1);
				++index;
			}
		}
		var precision = -1;
		if (format[index] === ".") {
			++index;
			precision = parseInt(format.substring(index), 10);
			if (isNaN(precision))
				precision = 0;
			while (format.isDigitAt(index))
				++index;
		}
		if (!(format[index] in formatters)) {
			addStringToken(format.substring(precentIndex, index + 1));
			++index;
			continue;
		}
		addSpecifierToken(format[index], precision, substitutionIndex);
		++substitutionIndex;
		++index;
	}
	addStringToken(format.substring(index));
	return tokens;
}
String.standardFormatters = {d: function(substitution)
{
	return !isNaN(substitution) ? substitution : 0;
},f: function(substitution, token)
{
	if (substitution && token.precision > -1)
		substitution = substitution.toFixed(token.precision);
	return !isNaN(substitution) ? substitution : (token.precision > -1 ? Number(0).toFixed(token.precision) : 0);
},s: function(substitution)
{
	return substitution;
}}
String.vsprintf = function(format, substitutions)
{
	return String.format(format, substitutions, String.standardFormatters, "", function(a, b) {
		return a + b;
	}).formattedResult;
}
String.format = function(format, substitutions, formatters, initialValue, append, tokenizedFormat)
{
	if (!format || !substitutions || !substitutions.length)
		return {formattedResult: append(initialValue, format),unusedSubstitutions: substitutions};
	function prettyFunctionName()
	{
		return "String.format(\"" + format + "\", \"" + Array.prototype.join.call(substitutions, "\", \"") + "\")";
	}
	function warn(msg)
	{
		console.warn(prettyFunctionName() + ": " + msg);
	}
	function error(msg)
	{
		console.error(prettyFunctionName() + ": " + msg);
	}
	var result = initialValue;
	var tokens = tokenizedFormat || String.tokenizeFormatString(format, formatters);
	var usedSubstitutionIndexes = {};
	for (var i = 0; i < tokens.length; ++i) {
		var token = tokens[i];
		if (token.type === "string") {
			result = append(result, token.value);
			continue;
		}
		if (token.type !== "specifier") {
			error("Unknown token type \"" + token.type + "\" found.");
			continue;
		}
		if (token.substitutionIndex >= substitutions.length) {
			error("not enough substitution arguments. Had " + substitutions.length + " but needed " + (token.substitutionIndex + 1) + ", so substitution was skipped.");
			result = append(result, "%" + (token.precision > -1 ? token.precision : "") + token.specifier);
			continue;
		}
		usedSubstitutionIndexes[token.substitutionIndex] = true;
		if (!(token.specifier in formatters)) {
			warn("unsupported format character \u201C" + token.specifier + "\u201D. Treating as a string.");
			result = append(result, substitutions[token.substitutionIndex]);
			continue;
		}
		result = append(result, formatters[token.specifier](substitutions[token.substitutionIndex], token));
	}
	var unusedSubstitutions = [];
	for (var i = 0; i < substitutions.length; ++i) {
		if (i in usedSubstitutionIndexes)
			continue;
		unusedSubstitutions.push(substitutions[i]);
	}
	return {formattedResult: result,unusedSubstitutions: unusedSubstitutions};
}
function createSearchRegex(query, caseSensitive, isRegex)
{
	var regexFlags = caseSensitive ? "g" : "gi";
	var regexObject;
	if (isRegex) {
		try {
			regexObject = new RegExp(query, regexFlags);
		} catch (e) {
		}
	}
	if (!regexObject)
		regexObject = createPlainTextSearchRegex(query, regexFlags);
	return regexObject;
}
function createPlainTextSearchRegex(query, flags)
{
	var regexSpecialCharacters = String.regexSpecialCharacters();
	var regex = "";
	for (var i = 0; i < query.length; ++i) {
		var c = query.charAt(i);
		if (regexSpecialCharacters.indexOf(c) != -1)
			regex += "\\";
		regex += c;
	}
	return new RegExp(regex, flags || "");
}
function countRegexMatches(regex, content)
{
	var text = content;
	var result = 0;
	var match;
	while (text && (match = regex.exec(text))) {
		if (match[0].length > 0)
			++result;
		text = text.substring(match.index + 1);
	}
	return result;
}
function spacesPadding(spacesCount)
{
	return Array(spacesCount).join("\u00a0");
}
function numberToStringWithSpacesPadding(value, symbolsCount)
{
	var numberString = value.toString();
	var paddingLength = Math.max(0, symbolsCount - numberString.length);
	return spacesPadding(paddingLength) + numberString;
}
var createObjectIdentifier = function()
{
	return "_" + ++createObjectIdentifier._last;
}
createObjectIdentifier._last = 0;
var Set = function()
{
	this._set = {};
	this._size = 0;
}
Set.fromArray = function(array)
{
	var result = new Set();
	array.forEach(function(item) {
		result.add(item);
	});
	return result;
}
Set.prototype = {add: function(item)
{
	var objectIdentifier = item.__identifier;
	if (!objectIdentifier) {
		objectIdentifier = createObjectIdentifier();
		item.__identifier = objectIdentifier;
	}
	if (!this._set[objectIdentifier])
		++this._size;
	this._set[objectIdentifier] = item;
},remove: function(item)
{
	if (this._set[item.__identifier]) {
		--this._size;
		delete this._set[item.__identifier];
		return true;
	}
	return false;
},values: function()
{
	var result = new Array(this._size);
	var i = 0;
	for (var objectIdentifier in this._set)
		result[i++] = this._set[objectIdentifier];
	return result;
},contains: function(item)
{
	return !!this._set[item.__identifier];
},size: function()
{
	return this._size;
},clear: function()
{
	this._set = {};
	this._size = 0;
}}
var Map = function()
{
	this._map = {};
	this._size = 0;
}
Map.prototype = {set: function(key, value)
{
	var objectIdentifier = key.__identifier;
	if (!objectIdentifier) {
		objectIdentifier = createObjectIdentifier();
		key.__identifier = objectIdentifier;
	}
	if (!this._map[objectIdentifier])
		++this._size;
	this._map[objectIdentifier] = [key, value];
},remove: function(key)
{
	var result = this._map[key.__identifier];
	if (!result)
		return undefined;
	--this._size;
	delete this._map[key.__identifier];
	return result[1];
},keys: function()
{
	return this._list(0);
},values: function()
{
	return this._list(1);
},_list: function(index)
{
	var result = new Array(this._size);
	var i = 0;
	for (var objectIdentifier in this._map)
		result[i++] = this._map[objectIdentifier][index];
	return result;
},get: function(key)
{
	var entry = this._map[key.__identifier];
	return entry ? entry[1] : undefined;
},has: function(key)
{
	var entry = this._map[key.__identifier];
	return !!entry;
},get size()
{
	return this._size;
},clear: function()
{
	this._map = {};
	this._size = 0;
}}
var StringMap = function()
{
	this._map = {};
	this._size = 0;
}
StringMap.prototype = {set: function(key, value)
{
	if (key === "__proto__") {
		if (!this._hasProtoKey) {
			++this._size;
			this._hasProtoKey = true;
		}
		this._protoValue = value;
		return;
	}
	if (!Object.prototype.hasOwnProperty.call(this._map, key))
		++this._size;
	this._map[key] = value;
},remove: function(key)
{
	var result;
	if (key === "__proto__") {
		if (!this._hasProtoKey)
			return undefined;
		--this._size;
		delete this._hasProtoKey;
		result = this._protoValue;
		delete this._protoValue;
		return result;
	}
	if (!Object.prototype.hasOwnProperty.call(this._map, key))
		return undefined;
	--this._size;
	result = this._map[key];
	delete this._map[key];
	return result;
},keys: function()
{
	var result = Object.keys(this._map) || [];
	if (this._hasProtoKey)
		result.push("__proto__");
	return result;
},values: function()
{
	var result = Object.values(this._map);
	if (this._hasProtoKey)
		result.push(this._protoValue);
	return result;
},get: function(key)
{
	if (key === "__proto__")
		return this._protoValue;
	if (!Object.prototype.hasOwnProperty.call(this._map, key))
		return undefined;
	return this._map[key];
},has: function(key)
{
	var result;
	if (key === "__proto__")
		return this._hasProtoKey;
	return Object.prototype.hasOwnProperty.call(this._map, key);
},get size()
{
	return this._size;
},clear: function()
{
	this._map = {};
	this._size = 0;
	delete this._hasProtoKey;
	delete this._protoValue;
}}
var StringMultimap = function()
{
	StringMap.call(this);
}
StringMultimap.prototype = {set: function(key, value)
{
	if (key === "__proto__") {
		if (!this._hasProtoKey) {
			++this._size;
			this._hasProtoKey = true;
			this._protoValue = new Set();
		}
		this._protoValue.add(value);
		return;
	}
	if (!Object.prototype.hasOwnProperty.call(this._map, key)) {
		++this._size;
		this._map[key] = new Set();
	}
	this._map[key].add(value);
},get: function(key)
{
	var result = StringMap.prototype.get.call(this, key);
	if (!result)
		result = new Set();
	return result;
},remove: function(key, value)
{
	var values = this.get(key);
	values.remove(value);
	if (!values.size())
		StringMap.prototype.remove.call(this, key)
},removeAll: function(key)
{
	StringMap.prototype.remove.call(this, key);
},values: function()
{
	var result = [];
	var keys = this.keys();
	for (var i = 0; i < keys.length; ++i)
		result.pushAll(this.get(keys[i]).values());
	return result;
},__proto__: StringMap.prototype}
var StringSet = function()
{
	this._map = new StringMap();
}
StringSet.fromArray = function(array)
{
	var result = new StringSet();
	array.forEach(function(item) {
		result.add(item);
	});
	return result;
}
StringSet.prototype = {add: function(value)
{
	this._map.set(value, true);
},remove: function(value)
{
	return !!this._map.remove(value);
},values: function()
{
	return this._map.keys();
},contains: function(value)
{
	return this._map.has(value);
},size: function()
{
	return this._map.size;
},clear: function()
{
	this._map.clear();
}}
function loadXHR(url)
{
	return new Promise(load);
	function load(successCallback, failureCallback)
	{
		function onReadyStateChanged()
		{
			if (xhr.readyState !== XMLHttpRequest.DONE)
				return;
			if (xhr.status !== 200) {
				xhr.onreadystatechange = null;
				failureCallback(new Error(xhr.status));
				return;
			}
			xhr.onreadystatechange = null;
			successCallback(xhr.responseText);
		}
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = onReadyStateChanged;
		xhr.send(null);
	}
}
function CallbackBarrier()
{
	this._pendingIncomingCallbacksCount = 0;
}
CallbackBarrier.prototype = {createCallback: function(userCallback)
{
	console.assert(!this._outgoingCallback, "CallbackBarrier.createCallback() is called after CallbackBarrier.callWhenDone()");
	++this._pendingIncomingCallbacksCount;
	return this._incomingCallback.bind(this, userCallback);
},callWhenDone: function(callback)
{
	console.assert(!this._outgoingCallback, "CallbackBarrier.callWhenDone() is called multiple times");
	this._outgoingCallback = callback;
	if (!this._pendingIncomingCallbacksCount)
		this._outgoingCallback();
},_incomingCallback: function(userCallback)
{
	console.assert(this._pendingIncomingCallbacksCount > 0);
	if (userCallback) {
		var args = Array.prototype.slice.call(arguments, 1);
		userCallback.apply(null, args);
	}
	if (!--this._pendingIncomingCallbacksCount && this._outgoingCallback)
		this._outgoingCallback();
}}
function suppressUnused(value)
{
}
self.setImmediate = (function() {
	var callbacks = [];
	function run() {
		var cbList = callbacks.slice();
		callbacks.length = 0;
		cbList.forEach(function(callback) {
			callback();
		});
	}
	;
	return function setImmediate(callback) {
		if (!callbacks.length)
			new Promise(function(resolve, reject) {
				resolve(null);
			}).then(run);
		callbacks.push(callback);
	};
})();
;
self.WebInspector = {};
WebInspector.Object = function() {
}
WebInspector.Object.prototype = {addEventListener: function(eventType, listener, thisObject)
{
	if (!listener)
		console.assert(false);
	if (!this._listeners)
		this._listeners = {};
	if (!this._listeners[eventType])
		this._listeners[eventType] = [];
	this._listeners[eventType].push({thisObject: thisObject,listener: listener});
},removeEventListener: function(eventType, listener, thisObject)
{
	console.assert(listener);
	if (!this._listeners || !this._listeners[eventType])
		return;
	var listeners = this._listeners[eventType];
	for (var i = 0; i < listeners.length; ++i) {
		if (listeners[i].listener === listener && listeners[i].thisObject === thisObject)
			listeners.splice(i--, 1);
	}
	if (!listeners.length)
		delete this._listeners[eventType];
},removeAllListeners: function()
{
	delete this._listeners;
},hasEventListeners: function(eventType)
{
	if (!this._listeners || !this._listeners[eventType])
		return false;
	return true;
},dispatchEventToListeners: function(eventType, eventData)
{
	if (!this._listeners || !this._listeners[eventType])
		return false;
	var event = new WebInspector.Event(this, eventType, eventData);
	var listeners = this._listeners[eventType].slice(0);
	for (var i = 0; i < listeners.length; ++i) {
		listeners[i].listener.call(listeners[i].thisObject, event);
		if (event._stoppedPropagation)
			break;
	}
	return event.defaultPrevented;
}}
WebInspector.Event = function(target, type, data)
{
	this.target = target;
	this.type = type;
	this.data = data;
	this.defaultPrevented = false;
	this._stoppedPropagation = false;
}
WebInspector.Event.prototype = {stopPropagation: function()
{
	this._stoppedPropagation = true;
},preventDefault: function()
{
	this.defaultPrevented = true;
},consume: function(preventDefault)
{
	this.stopPropagation();
	if (preventDefault)
		this.preventDefault();
}}
WebInspector.EventTarget = function()
{
}
WebInspector.EventTarget.prototype = {addEventListener: function(eventType, listener, thisObject) {
},removeEventListener: function(eventType, listener, thisObject) {
},removeAllListeners: function() {
},hasEventListeners: function(eventType) {
},dispatchEventToListeners: function(eventType, eventData) {
},};
WebInspector.NotificationService = function() {
}
WebInspector.NotificationService.prototype = {__proto__: WebInspector.Object.prototype}
WebInspector.NotificationService.Events = {InspectorAgentEnabledForTests: "InspectorAgentEnabledForTests",SelectedNodeChanged: "SelectedNodeChanged"}
WebInspector.notifications = new WebInspector.NotificationService();







WebInspector.Settings = function()
{
	this._eventSupport = new WebInspector.Object();
	this._registry = ({});
	this.colorFormat = this.createSetting("colorFormat", "original");
	this.consoleHistory = this.createSetting("consoleHistory", []);
	this.domWordWrap = this.createSetting("domWordWrap", true);
	this.eventListenersFilter = this.createSetting("eventListenersFilter", "all");
	this.lastViewedScriptFile = this.createSetting("lastViewedScriptFile", "application");
	this.monitoringXHREnabled = this.createSetting("monitoringXHREnabled", false);
	this.preserveConsoleLog = this.createSetting("preserveConsoleLog", false);
	this.consoleTimestampsEnabled = this.createSetting("consoleTimestampsEnabled", false);
	this.resourcesLargeRows = this.createSetting("resourcesLargeRows", true);
	this.resourcesSortOptions = this.createSetting("resourcesSortOptions", {timeOption: "responseTime",sizeOption: "transferSize"});
	this.resourceViewTab = this.createSetting("resourceViewTab", "preview");
	this.showInheritedComputedStyleProperties = this.createSetting("showInheritedComputedStyleProperties", false);
	this.showUserAgentStyles = this.createSetting("showUserAgentStyles", true);
	this.watchExpressions = this.createSetting("watchExpressions", []);
	this.breakpoints = this.createSetting("breakpoints", []);
	this.eventListenerBreakpoints = this.createSetting("eventListenerBreakpoints", []);
	this.domBreakpoints = this.createSetting("domBreakpoints", []);
	this.xhrBreakpoints = this.createSetting("xhrBreakpoints", []);
	this.jsSourceMapsEnabled = this.createSetting("sourceMapsEnabled", true);
	this.cssSourceMapsEnabled = this.createSetting("cssSourceMapsEnabled", true);
	this.cacheDisabled = this.createSetting("cacheDisabled", false);
	this.showUAShadowDOM = this.createSetting("showUAShadowDOM", false);
	this.savedURLs = this.createSetting("savedURLs", {});
	this.javaScriptDisabled = this.createSetting("javaScriptDisabled", false);
	this.showAdvancedHeapSnapshotProperties = this.createSetting("showAdvancedHeapSnapshotProperties", false);
	this.recordAllocationStacks = this.createSetting("recordAllocationStacks", false);
	this.highResolutionCpuProfiling = this.createSetting("highResolutionCpuProfiling", false);
	this.searchInContentScripts = this.createSetting("searchInContentScripts", false);
	this.textEditorIndent = this.createSetting("textEditorIndent", "    ");
	this.textEditorAutoDetectIndent = this.createSetting("textEditorAutoIndentIndent", true);
	this.textEditorAutocompletion = this.createSetting("textEditorAutocompletion", true);
	this.textEditorBracketMatching = this.createSetting("textEditorBracketMatching", true);
	this.cssReloadEnabled = this.createSetting("cssReloadEnabled", false);
	this.timelineLiveUpdate = this.createSetting("timelineLiveUpdate", true);
	this.showMetricsRulers = this.createSetting("showMetricsRulers", false);
	this.workerInspectorWidth = this.createSetting("workerInspectorWidth", 600);
	this.workerInspectorHeight = this.createSetting("workerInspectorHeight", 600);
	this.messageURLFilters = this.createSetting("messageURLFilters", {});
	this.networkHideDataURL = this.createSetting("networkHideDataURL", false);
	this.networkResourceTypeFilters = this.createSetting("networkResourceTypeFilters", {});
	this.messageLevelFilters = this.createSetting("messageLevelFilters", {});
	this.splitVerticallyWhenDockedToRight = this.createSetting("splitVerticallyWhenDockedToRight", true);
	this.visiblePanels = this.createSetting("visiblePanels", {});
	this.shortcutPanelSwitch = this.createSetting("shortcutPanelSwitch", false);
	this.showWhitespacesInEditor = this.createSetting("showWhitespacesInEditor", false);
	this.skipStackFramesPattern = this.createRegExpSetting("skipStackFramesPattern", "");
	this.skipContentScripts = this.createSetting("skipContentScripts", false);
	this.pauseOnExceptionEnabled = this.createSetting("pauseOnExceptionEnabled", false);
	this.pauseOnCaughtException = this.createSetting("pauseOnCaughtException", false);
	this.enableAsyncStackTraces = this.createSetting("enableAsyncStackTraces", false);
	this.showMediaQueryInspector = this.createSetting("showMediaQueryInspector", false);
	this.disableOverridesWarning = this.createSetting("disableOverridesWarning", false);
	this.showPaintRects = this.createSetting("showPaintRects", false);
	this.showDebugBorders = this.createSetting("showDebugBorders", false);
	this.showFPSCounter = this.createSetting("showFPSCounter", false);
	this.continuousPainting = this.createSetting("continuousPainting", false);
	this.showScrollBottleneckRects = this.createSetting("showScrollBottleneckRects", false);
}
WebInspector.Settings.prototype = {createSetting: function(key, defaultValue)
{
	if (!this._registry[key])
		this._registry[key] = new WebInspector.Setting(key, defaultValue, this._eventSupport, window.localStorage);
	return this._registry[key];
},createRegExpSetting: function(key, defaultValue, regexFlags)
{
	if (!this._registry[key])
		this._registry[key] = new WebInspector.RegExpSetting(key, defaultValue, this._eventSupport, window.localStorage, regexFlags);
	return this._registry[key];
}}
WebInspector.Setting = function(name, defaultValue, eventSupport, storage)
{
	this._name = name;
	this._defaultValue = defaultValue;
	this._eventSupport = eventSupport;
	this._storage = storage;
}
WebInspector.Setting.prototype = {addChangeListener: function(listener, thisObject)
{
	this._eventSupport.addEventListener(this._name, listener, thisObject);
},removeChangeListener: function(listener, thisObject)
{
	this._eventSupport.removeEventListener(this._name, listener, thisObject);
},get name()
{
	return this._name;
},get: function()
{
	if (typeof this._value !== "undefined")
		return this._value;
	this._value = this._defaultValue;
	if (this._storage && this._name in this._storage) {
		try {
			this._value = JSON.parse(this._storage[this._name]);
		} catch (e) {
			delete this._storage[this._name];
		}
	}
	return this._value;
},set: function(value)
{
	this._value = value;
	if (this._storage) {
		try {
			var settingString = JSON.stringify(value);
			try {
				this._storage[this._name] = settingString;
			} catch (e) {
				this._printSettingsSavingError(e.message, this._name, settingString);
			}
		} catch (e) {
			WebInspector.console.error("Cannot stringify setting with name: " + this._name + ", error: " + e.message);
		}
	}
	this._eventSupport.dispatchEventToListeners(this._name, value);
},_printSettingsSavingError: function(message, name, value)
{
	var errorMessage = "Error saving setting with name: " + this._name + ", value length: " + value.length + ". Error: " + message;
	console.error(errorMessage);
	WebInspector.console.error(errorMessage);
	WebInspector.console.log("Ten largest settings: ");
	var sizes = {__proto__: null};
	for (var key in this._storage)
		sizes[key] = this._storage.getItem(key).length;
	var keys = Object.keys(sizes);
	function comparator(key1, key2)
	{
		return sizes[key2] - sizes[key1];
	}
	keys.sort(comparator);
	for (var i = 0; i < 10 && i < keys.length; ++i)
		WebInspector.console.log("Setting: '" + keys[i] + "', size: " + sizes[keys[i]]);
}}



WebInspector.ResizerWidget = function()
{
	WebInspector.Object.call(this);
	this._isEnabled = true;
	this._isVertical = true;
	this._elements = [];
	this._installDragOnMouseDownBound = this._installDragOnMouseDown.bind(this);
};
WebInspector.ResizerWidget.Events = {ResizeStart: "ResizeStart",ResizeUpdate: "ResizeUpdate",ResizeEnd: "ResizeEnd"};
WebInspector.ResizerWidget.prototype = {isEnabled: function()
{
	return this._isEnabled;
},setEnabled: function(enabled)
{
	this._isEnabled = enabled;
	this._updateElementsClass();
},isVertical: function()
{
	return this._isVertical;
},setVertical: function(vertical)
{
	this._isVertical = vertical;
	this._updateElementsClass();
},elements: function()
{
	return this._elements.slice();
},addElement: function(element)
{
	if (this._elements.indexOf(element) !== -1)
		return;
	this._elements.push(element);
	element.addEventListener("mousedown", this._installDragOnMouseDownBound, false);
	element.classList.toggle("ns-resizer-widget", this._isVertical && this._isEnabled);
	element.classList.toggle("ew-resizer-widget", !this._isVertical && this._isEnabled);
},removeElement: function(element)
{
	if (this._elements.indexOf(element) === -1)
		return;
	this._elements.remove(element);
	element.removeEventListener("mousedown", this._installDragOnMouseDownBound, false);
	element.classList.remove("ns-resizer-widget");
	element.classList.remove("ew-resizer-widget");
},_updateElementsClass: function()
{
	for (var i = 0; i < this._elements.length; ++i) {
		this._elements[i].classList.toggle("ns-resizer-widget", this._isVertical && this._isEnabled);
		this._elements[i].classList.toggle("ew-resizer-widget", !this._isVertical && this._isEnabled);
	}
},_installDragOnMouseDown: function(event)
{
	if (this._elements.indexOf(event.target) === -1)
		return false;
	WebInspector.elementDragStart(this._dragStart.bind(this), this._drag.bind(this), this._dragEnd.bind(this), this._isVertical ? "ns-resize" : "ew-resize", event);
},_dragStart: function(event)
{
	if (!this._isEnabled)
		return false;
	this._startPosition = this._isVertical ? event.pageY : event.pageX;
	this.dispatchEventToListeners(WebInspector.ResizerWidget.Events.ResizeStart, {startPosition: this._startPosition,currentPosition: this._startPosition});
	return true;
},_drag: function(event)
{
	if (!this._isEnabled) {
		this._dragEnd(event);
		return true;
	}
	var position = this._isVertical ? event.pageY : event.pageX;
	this.dispatchEventToListeners(WebInspector.ResizerWidget.Events.ResizeUpdate, {startPosition: this._startPosition,currentPosition: position,shiftKey: event.shiftKey});
	event.preventDefault();
	return false;
},_dragEnd: function(event)
{
	this.dispatchEventToListeners(WebInspector.ResizerWidget.Events.ResizeEnd);
	delete this._startPosition;
},__proto__: WebInspector.Object.prototype};
;








WebInspector.SplitView = function(isVertical, secondIsSidebar, settingName, defaultSidebarWidth, defaultSidebarHeight, constraintsInDip)
{
	WebInspector.View.call(this);
	this.element.classList.add("split-view");
	this._mainView = new WebInspector.VBox();
	this._mainElement = this._mainView.element;
	this._mainElement.className = "split-view-contents split-view-main vbox";
	this._sidebarView = new WebInspector.VBox();
	this._sidebarElement = this._sidebarView.element;
	this._sidebarElement.className = "split-view-contents split-view-sidebar vbox";
	this._resizerElement = this.element.createChild("div", "split-view-resizer");
	this._resizerElement.createChild("div", "split-view-resizer-border");
	if (secondIsSidebar) {
		this._mainView.show(this.element);
		this._sidebarView.show(this.element);
	} else {
		this._sidebarView.show(this.element);
		this._mainView.show(this.element);
	}
	this._resizerWidget = new WebInspector.ResizerWidget();
	this._resizerWidget.setEnabled(true);
	this._resizerWidget.addEventListener(WebInspector.ResizerWidget.Events.ResizeStart, this._onResizeStart, this);
	this._resizerWidget.addEventListener(WebInspector.ResizerWidget.Events.ResizeUpdate, this._onResizeUpdate, this);
	this._resizerWidget.addEventListener(WebInspector.ResizerWidget.Events.ResizeEnd, this._onResizeEnd, this);
	this._defaultSidebarWidth = defaultSidebarWidth || 200;
	this._defaultSidebarHeight = defaultSidebarHeight || this._defaultSidebarWidth;
	this._constraintsInDip = !!constraintsInDip;
	this._settingName = settingName;
	this.setSecondIsSidebar(secondIsSidebar);
	this._innerSetVertical(isVertical);
	this._showMode = WebInspector.SplitView.ShowMode.Both;
	this.installResizer(this._resizerElement);
}
