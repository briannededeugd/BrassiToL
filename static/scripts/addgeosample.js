import { promises as fs } from "fs";

const metadataFile = "BrassiToL_metadata.json";
const oldFile = "BrassiToL_geoareas.json";
const updatedMetadataFile = "BrassiToL_updated_metadata.json";

// Function to add WCVP_WGSRPD_LEVEL_3_native to metadata
async function updateMetadata() {
	try {
		// Read the contents of both files
		const metadataContent = await fs.readFile(metadataFile, "utf8");
		const oldFileContent = await fs.readFile(oldFile, "utf8");

		// Parse the contents as JSON
		const metadata = JSON.parse(metadataContent);
		const oldData = JSON.parse(oldFileContent);

		// Convert oldData to a map for efficient lookups
		const oldDataMap = new Map(
			oldData.map((item) => [item.SAMPLE, item.WCVP_WGSRPD_LEVEL_1_native])
		);

		// Update metadata with WCVP_WGSRPD_LEVEL_3_native from oldData
		metadata.forEach((item) => {
			if (oldDataMap.has(item.SAMPLE)) {
				item.WCVP_WGSRPD_LEVEL_1_native = oldDataMap.get(item.SAMPLE);
			}
		});

		// Write the updated metadata back to a new file
		await fs.writeFile(updatedMetadataFile, JSON.stringify(metadata, null, 4));
		console.log("Metadata updated and saved to " + updatedMetadataFile);
	} catch (error) {
		console.error("An error occurred:", error);
	}
}

updateMetadata();
