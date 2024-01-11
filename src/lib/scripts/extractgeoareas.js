import csvtojson from "csvtojson";
import { promises as fs } from "fs";

const csvFilePath = "BrassiToL_geogeo.csv";
const jsonFilePath = "BrassiToL_geographicalareas.json";

csvtojson({
	delimiter: ";", // Have to set the delimiter to a semicolon apparently
})
	.fromFile(csvFilePath)
	.then(async (json) => {
		await fs.writeFile(jsonFilePath, JSON.stringify(json, null, 4));
		console.log("Conversion completed, JSON saved to " + jsonFilePath);
	})
	.catch((error) => {
		console.error("An error occurred:", error);
	});
