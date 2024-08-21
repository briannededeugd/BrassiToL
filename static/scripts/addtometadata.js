// Import necessary modules
// import { match } from "assert";
import fs from "fs";
import path from "path";

// Define file paths
const metadataToAddPath =
  "/Users/briannededeugd/Desktop/BrassiToL/static/metadata/BrassiToL_authorsspecimen.json";
const metadataPath =
  "/Users/briannededeugd/Desktop/BrassiToL/static/metadata/BrassiToL_metadata.json";

// Read JSON files and parse them into objects
const readJsonFile = (filePath) => {
  try {
    const rawData = fs.readFileSync(path.resolve(filePath), "utf8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading file ${filePath}: `, error);
    return null;
  }
};

const metadataToAdd = readJsonFile(metadataToAddPath);
const metadata = readJsonFile(metadataPath);

// Loop over metadataToAdd and update metadata accordingly
metadataToAdd.forEach((authorObj) => {
  const matchingMetadata = metadata.find(
    (metaObj) => metaObj.SAMPLE === authorObj.SAMPLE,
  );

  if (matchingMetadata) {
    // Override AUTHOR property in metadata object
    matchingMetadata.COLLECTION_YEAR = authorObj.COLLECTION_YEAR;
  }
});

// Optionally, write updated metadata back to file if needed
const writeJsonFile = (filePath, data) => {
  try {
    const jsonData = JSON.stringify(data, null, 2); // Pretty print JSON
    fs.writeFileSync(path.resolve(filePath), jsonData, "utf8");
  } catch (error) {
    console.error(`Error writing file ${filePath}: `, error);
  }
};

writeJsonFile(metadataPath, metadata);

console.log("Metadata has been updated.");
