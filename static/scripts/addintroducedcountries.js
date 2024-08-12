import { promises as fs } from "fs";

async function mergeIntroducedData(
  introducedFilePath,
  completeDataFilePath,
  outputFilePath,
) {
  try {
    // Read the INTRODUCED.JSON file
    const introducedData = JSON.parse(
      await fs.readFile(introducedFilePath, "utf8"),
    );

    // Read the COMPLETEDATA.JSON file
    const completeData = JSON.parse(
      await fs.readFile(completeDataFilePath, "utf8"),
    );

    // Create a map for quick lookup based on SAMPLE in INTRODUCED.JSON
    const introducedMap = new Map(
      introducedData.map((entry) => [
        entry.SAMPLE,
        entry.WCVP_WGSRPD_LEVEL_3_introduced,
      ]),
    );

    // Update the completeData with the introduced data if SAMPLE matches
    const updatedCompleteData = completeData.map((entry) => {
      if (introducedMap.has(entry.SAMPLE)) {
        entry.WCVP_WGSRPD_LEVEL_3_introduced = introducedMap.get(entry.SAMPLE);
      }
      return entry;
    });

    // Write the updated data to a new file
    await fs.writeFile(
      outputFilePath,
      JSON.stringify(updatedCompleteData, null, 4),
      "utf8",
    );

    console.log(
      `The file has been saved with the merged data to ${outputFilePath}`,
    );
  } catch (err) {
    console.error("An error occurred:", err);
  }
}

// Define file paths
const introducedFilePath = "static/metadata/NEW_BrassiToL_metadata.json";
const completeDataFilePath = "static/metadata/BrassiToL_metadata.JSON"; // Replace with your actual file path
const outputFilePath = "static/metadata/UPDATED_BrassiToL_metadata.JSON"; // Output file path

// Call the function to merge the data
mergeIntroducedData(introducedFilePath, completeDataFilePath, outputFilePath);
