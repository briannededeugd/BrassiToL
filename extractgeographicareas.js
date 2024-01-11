import { promises as fs } from "fs";

const oldFile = "BrassiToL_geographicalareas.json";
const newFile = "BrassiToL_geoareatosamplesize.json";

fs.readFile(oldFile, "utf8")
	.then((data) => {
		const json = JSON.parse(data);

		// Map each object to only include the specified properties
		const modifiedJson = json.map((item) => ({
			WCVP_WGSRPD_LEVEL_1_native: item.WCVP_WGSRPD_LEVEL_1_native,
			SAMPLE: item.SAMPLE,
		}));

		return fs.writeFile(newFile, JSON.stringify(modifiedJson, null, 4));
	})
	.then(() => {
		console.log("Conversion completed, JSON saved to " + newFile);
	})
	.catch((error) => {
		console.error("An error occurred:", error);
	});
