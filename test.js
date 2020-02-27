console.log("---- Example 1 ---------------------------------------")
console.log(parseJsonFile("example.json"));
console.log("---- Example 2 ---------------------------------------")
console.log(uncommentFile("example.js"));

function parseJsonFile(filename) {
	try {
		return JSON.parse( uncommentFile( filename ));
	}
	catch (error) {
		console.log(error);
	}
}

function uncommentFile(filename) {
	const fs = require("fs");
	const unComment = require("./ok-uncomment");
	return unComment( fs.readFileSync(filename).toString());
}
