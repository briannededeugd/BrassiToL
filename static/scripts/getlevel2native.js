// Importing fs module using ES6 syntax
import { promises as fs } from "fs";

const oldFilePath =
  "/Users/briannededeugd/Desktop/BrassiToL/static/metadata/BrassiToL_largemetadata.json";
const newFilePath =
  "/Users/briannededeugd/Desktop/BrassiToL/static/metadata/BrassiToL_level2s.json";

fs.readFile(oldFilePath, "utf8")
  .then((data) => {
    // Parse the JSON data
    const json = JSON.parse(data);

    // Modify each object to keep only 'SAMPLE' and 'WCVP_WGSRPD_LEVEL_2_native'
    const modifiedJson = json.map((item) => ({
      SAMPLE: item.SAMPLE,
      WCVP_WGSRPD_LEVEL_2_native: item.WCVP_WGSRPD_LEVEL_2_native,
    }));

    // Write the modified data back to a new file
    return fs.writeFile(newFilePath, JSON.stringify(modifiedJson, null, 4));
  })
  .then(() => {
    console.log("Conversion completed, JSON saved to " + newFilePath);
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
