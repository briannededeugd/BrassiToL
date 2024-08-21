// THIS FILE: TRANSFORMS STRINGS IN WHICH THE VALUES ARE SEPERATED BY THE WORD "OR" AND COMMAS TO AN ARRAY
// E.G. "red, white or blue" BECOMES ["red", "white", "blue"]

import { promises as fs } from "fs";

function splitAndTrim(str, delimiter) {
  return str.split(delimiter).map((item) => item.trim());
}

async function processLifeformDescriptions(jsonData) {
  return jsonData.map((entry) => {
    let lifeformDesc = entry.WCVP_lifeform_description;

    if (typeof lifeformDesc === "string") {
      // If the string contains 'or', split it
      if (lifeformDesc.includes(" or ")) {
        entry.WCVP_lifeform_description = splitAndTrim(lifeformDesc, " or ");
      }
    } else if (Array.isArray(lifeformDesc)) {
      // If it's an array, check each element
      let combinedArray = [];
      lifeformDesc.forEach((element) => {
        if (element.includes(",")) {
          combinedArray.push(...splitAndTrim(element, ","));
        } else {
          combinedArray.push(element.trim());
        }
      });
      entry.WCVP_lifeform_description = combinedArray;
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
    const modifiedJsonData = await processLifeformDescriptions(jsonData);

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
