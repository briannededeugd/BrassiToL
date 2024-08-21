// THIS FILE: TRANSFORMS STRINGS IN WHICH THE VALUES ARE SEPERATED BY COMMAS TO AN ARRAY
// E.G. "yes, no, maybe" BECOMES ["yes", "no", "maybe"]

import { promises as fs } from "fs";

function splitAndTrim(str, delimiter) {
	return str.split(delimiter).map((item) => item.trim());
}

async function processnativeGeoArea(jsonData) {
	return jsonData.map((entry) => {
		let nativeGeoArea = entry.WCVP_WGSRPD_LEVEL_1_native;

		if (typeof nativeGeoArea === "string") {
			// If the string contains 'or', split it
			if (nativeGeoArea.includes(",")) {
				entry.WCVP_WGSRPD_LEVEL_1_native = splitAndTrim(nativeGeoArea, ",");
			}
		}
		return entry;
	});
}

async function modifyJsonFile() {
	try {
		const jsonFilePath = "$metadata/BrassiToL_geoareatosamplesize.json";
		const modifiedJsonFilePath = "$metadata/BrassiToL_metadata_modified.json";

		// Read the JSON file
		const data = await fs.readFile(jsonFilePath, "utf8");
		const jsonData = JSON.parse(data);

		// Process the JSON data
		const modifiedJsonData = await processnativeGeoArea(jsonData);

		// Write the modified data to a new file
		await fs.writeFile(
			modifiedJsonFilePath,
			JSON.stringify(modifiedJsonData, null, 4),
			"utf8"
		);
		console.log(
			"The file has been saved with the modifications to " +
				modifiedJsonFilePath
		);
	} catch (err) {
		console.error("An error occurred:", err);
	}
}

modifyJsonFile();
