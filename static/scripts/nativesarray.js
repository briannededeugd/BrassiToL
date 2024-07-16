import { promises as fs } from "fs";

function splitAndTrim(str, delimiter) {
	return str.split(delimiter).map((item) => item.trim());
}

async function processnativecountriesriptions(jsonData) {
	return jsonData.map((entry) => {
		let nativecountries = entry.WCVP_WGSRPD_LEVEL_3_native;

		if (typeof nativecountries === "string") {
			// If the string contains 'or', split it
			if (nativecountries.includes(",")) {
				entry.WCVP_WGSRPD_LEVEL_3_native = splitAndTrim(nativecountries, ",");
			}
		}
		return entry;
	});
}

async function modifyJsonFile() {
	try {
		const jsonFilePath = "BrassiToL_metadata.json";
		const modifiedJsonFilePath = "BrassiToL_metadata_modified.json";

		// Read the JSON file
		const data = await fs.readFile(jsonFilePath, "utf8");
		const jsonData = JSON.parse(data);

		// Process the JSON data
		const modifiedJsonData = await processnativecountriesriptions(jsonData);

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
