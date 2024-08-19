import { promises as fs } from "fs";

function splitAndTrim(str, delimiter) {
  return str.split(delimiter).map((item) => item.trim());
}

async function processlvl2value(jsonData) {
  return jsonData.map((entry) => {
    let lvl2value = entry.WCVP_WGSRPD_LEVEL_2_native;

    if (typeof lvl2value === "string") {
      // If the string contains 'or', split it
      if (lvl2value.includes(",")) {
        entry.WCVP_WGSRPD_LEVEL_2_native = splitAndTrim(lvl2value, ",");
      }
    }
    return entry;
  });
}

async function modifyJsonFile() {
  try {
    const jsonFilePath = "static/metadata/BrassiToL_metadata.json";
    const modifiedJsonFilePath = "static/metadata/BrassiToL_metadata_modified.json";

    // Read the JSON file
    const data = await fs.readFile(jsonFilePath, "utf8");
    const jsonData = JSON.parse(data);

    // Process the JSON data
    const modifiedJsonData = await processlvl2value(jsonData);

    // Write the modified data to a new file
    await fs.writeFile(
      modifiedJsonFilePath,
      JSON.stringify(modifiedJsonData, null, 4),
      "utf8",
    );
    console.log(
      "The file has been saved with the modifications to " +
        modifiedJsonFilePath,
    );
  } catch (err) {
    console.error("An error occurred:", err);
  }
}

modifyJsonFile();
