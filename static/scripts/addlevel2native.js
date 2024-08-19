// Importing fs module using ES6 syntax
import { promises as fs } from "fs";

const oldFilePath =
  "/Users/briannededeugd/Desktop/BrassiToL/static/metadata/BrassiToL_level2s.json";
const newFilePath =
  "/Users/briannededeugd/Desktop/BrassiToL/static/metadata/BrassiToL_metadata.json";

async function mergeProperties() {
  try {
    // Read the old and new JSON files
    const oldDataRaw = await fs.readFile(oldFilePath, "utf8");
    const newDataRaw = await fs.readFile(newFilePath, "utf8");

    // Parse the JSON data
    const oldData = JSON.parse(oldDataRaw);
    let newData = JSON.parse(newDataRaw);

    // Iterate over the old data
    for (const oldItem of oldData) {
      // Find the matching item in the new data
      const newItem = newData.find((item) => item.SAMPLE === oldItem.SAMPLE);

      // If a matching item is found, add the WCVP_WGSRPD_LEVEL_2_native property
      if (newItem) {
        newItem.WCVP_WGSRPD_LEVEL_2_native = oldItem.WCVP_WGSRPD_LEVEL_2_native;
      }
    }

    // Write the modified new data back to the new file
    await fs.writeFile(newFilePath, JSON.stringify(newData, null, 4));

    console.log("Properties merged successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

mergeProperties();
