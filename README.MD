# ok-uncomment

**ok-uncomment** provides a function that removes javascript-style comments (both block comments and 
line comments) from the desired source text. It takes into account regular expressions and string 
literals limited by double quotes, single quotes, and backticks. It can also handle 
nested block comments.


## Installation

npm install ok-uncomment


## Usage

const noComments = require("ok-uncomment");


### Syntax

**noComments( source ) -> result**

- Parameters
	- source *string*
- Return value: string

Function throws an error object in case of failure.


**noComments( onError, onSuccess, source )**

- Parameters: 
	- onError *function(error)*
	- onSuccess	*function(result)*
	- source *string*

Function does not throw error object in case of failure.


### Errors

- E_UNCLOSEDCOMMENT (row: ROW_NUMBER)
- E_UNCLOSEDSINGLEQUOTE (row: ROW_NUMBER)
- E_UNCLOSEDDOUBLEQUOTE (row: ROW_NUMBER)
- E_UNCLOSEDBACKTICK (row: ROW_NUMBER)
- E_UNCLOSEDREGEX (row: ROW_NUMBER)



## Examples

	   
	function uncommentFile(filename) {
		const fs = require("fs");
		const noComments = require("ok-uncomment");
		return noComments( fs.readFileSync(filename).toString());
	}
       
	console.log(uncommentFile("example.js"));
      

      
	function parseJsonFile(filename) {
		const noComments = require("ok-uncomment");
		try {
			return JSON.parse( uncommentFile( filename ));
		}
		catch (error) {
			console.log(error);
		}
	}
       
	console.log(parseJsonFile("example.json"));
	 

