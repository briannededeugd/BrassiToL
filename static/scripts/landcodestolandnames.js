import { promises as fs } from "fs";

const oldFile = "BrassiToL_landcodes_ALL.json";
const newFile = "BrassiToL_landcodes.json";

fs.readFile(oldFile, "utf8")
	.then((data) => {
		// Parse the JSON data
		const json = JSON.parse(data);

		// Remove 'field5' and 'field6' from each object
		const modifiedJson = json.map((item) => {
			delete item.field5;
			delete item.field6;
			return item;
		});

		// Write the modified data back to a new file
		return fs.writeFile(newFile, JSON.stringify(modifiedJson, null, 4));
	})
	.then(() => {
		console.log("Conversion completed, JSON saved to " + newFile);
	})
	.catch((error) => {
		console.error("An error occurred:", error);
	});
