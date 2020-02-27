/*
-----------------------------------------------------------------------------------------
 ok-uncomment.js
-----------------------------------------------------------------------------------------
 (c) Olli Kekäläinen, Rajahyöty Oy
 

	Usage:

		unComment( source ) -> result

			Parameters: 
				source 		string

			Return value: string

			In case of failure function throws an error object

		=== or ===

		unComment( onError, onSuccess, source )
	
			Parameters: 
				onError  	function(error)
				onSuccess	function(result)
				source 		string
			

			Does not throw error object in case of failure.

	Errors:

		E_UNCLOSEDCOMMENT (row: ROW_NUMBER)
		E_UNCLOSEDSINGLEQUOTE (row: ROW_NUMBER)
		E_UNCLOSEDDOUBLEQUOTE (row: ROW_NUMBER)
		E_UNCLOSEDBACKTICK (row: ROW_NUMBER)
		E_UNCLOSEDREGEXP (row: ROW_NUMBER)



 20200227
-----------------------------------------------------------------------------------------
*/

module.exports = unComment;

function unComment( onError, onSuccess, source ) {

	if (typeof onError == "string") {
		source = onError;
		onError = undefined;
		onSuccess = undefined;
	}

	const s = source;
	const length = s.length;
	const SINGLEQUOTE = "'", DOUBLEQUOTE = '"', BACKTICK = "`";
	const LINEBREAK_1 = process.platform == "win32" ? "\r" : "\n";
	const isRegExpDelim = c => !c||" \t\r\n(,=:[!&|?{};\/".indexOf(c)>-1;

	let quote = undefined;
	let blockComment = 0;
	let lineComment = false;
	let regexp = false;
	let brackets = false;
	let i = 0;
	let target = "";
	let error, char, previous;
	let row = 0;
	let backTicRow = 0;
	let blockCommentRow = 0;
	let regexpRow;

	while (i < length) {
		previous = char;
		char = s[i];
		char == "\n" && row++;
		if (!quote && !regexp && !lineComment) {
			if (previous == "\\" && s[i-2] !== "\\") {
				// ignore escaped characters inside block comments
			}
			else if (char == "/" && s[i+1] == "*") {
				blockComment || (blockCommentRow = row);
				++blockComment;
				i += 2;
				continue;
			}
			else if (char == "*" && s[i+1] == "/" && blockComment) {
				--blockComment;
				i += 2;
				continue;
			}
 			else if (!blockComment && char == "/") {
 				if (s[i+1] == "/") {
					lineComment = true;
					i += 2;
					continue;
 				}
 				else if (regexp = isRegExpDelim(previous)) {
					regexpRow = row;
					target += char;
 					++i;
 					continue;
 				}
 			}
		}

		if (!blockComment && !lineComment) {
			if (previous == "\\" && s[i-2] !== "\\") {
				// ignore escaped characters in regular expressions and string literals
			}
			else if (char == LINEBREAK_1) {
				if (quote==DOUBLEQUOTE || quote==SINGLEQUOTE) {
					// unclosed string literal, let's exit the loop
					i = length;
					continue;
				}
			}
			else if (regexp) {
				if (char == "\n") {
					// unclosed reqular expression, let's exit the loop
					i = length;
					continue;
				}
				else if (char == "[") {
					brackets = true;
				} 
				else if (char == "]" && brackets) {
					brackets = false;
				} 
				else if (char == "/" && !brackets) {
					regexp = false;
				}
			}
			else if (char == DOUBLEQUOTE && (!quote || quote==DOUBLEQUOTE)) {
				quote = quote ? undefined : DOUBLEQUOTE;
			}
			else if (char == SINGLEQUOTE && (!quote || quote==SINGLEQUOTE)) {
				quote = quote ? undefined : SINGLEQUOTE;
			}
			else if (char == BACKTICK && (!quote || quote==BACKTICK)) {
				quote || (backTicRow = row);
				quote = quote ? undefined : BACKTICK;
			}
			target += char;
		}
		else if (char == "\n" && lineComment) {
			lineComment = false;
			target += char;
		}
		++i;
	}

	if (blockComment > 0)	{
		error = new Error( "E_UNCLOSEDCOMMENT (row: " + blockCommentRow + ")" );
	}
	else if (regexp) {
		error = new Error( "E_UNCLOSEDREGEXP (row: " + (row) + ")" );
	}
	else if (quote==SINGLEQUOTE) {
		error = new Error( "E_UNCLOSEDSINGLEQUOTE (row: " + (row) + ")" );
	}
	else if (quote==DOUBLEQUOTE) {
		error = new Error( "E_UNCLOSEDDOUBLEQUOTE (row: " + (row) + ")" );
	}
	else if (quote==BACKTICK) {
		error = new Error( "E_UNCLOSEDBACKTICK (row: " + backTicRow + ")" );
	}
	if (error) {
		if (onError) {
			onError( error );
		}
		else {
			throw error;
		}
	}
	else {
		if (onSuccess) {
			onSuccess(target);
		}
		else {
			return target;
		}
	}
}

function __debug(s,row) {
	const __solve = (c) => {
		if (c=="\r") {
			return "\\r";
		}
		else if (c=="\n") {
			return "\\n";
		}
		return c;
	};
	let m = "";
	s.split("").forEach((c) => {
		m += __solve(c);
	});
	console.log( (row ? (row + ": ") : "") + m);
}

