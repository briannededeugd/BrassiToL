// Import necessary modules
// import { match } from "assert";
import fs from "fs";
import path from "path";

// Define file paths
const authorMetadataPath =
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

const authorMetadata = readJsonFile(authorMetadataPath);
const metadata = readJsonFile(metadataPath);

// Loop over authorMetadata and update metadata accordingly
authorMetadata.forEach((authorObj) => {
  const matchingMetadata = metadata.find(
    (metaObj) => metaObj.SAMPLE === authorObj.SAMPLE,
  );

  if (matchingMetadata) {
    // Override AUTHOR property in metadata object
    matchingMetadata.AUTHOR = authorObj.AUTHOR;
    matchingMetadata.COLLECTION = authorObj.COLLECTION;
    matchingMetadata.COLLECTION_CODE = authorObj.COLLECTION_CODE;
    matchingMetadata.COLLECTOR = authorObj.COLLECTOR;
    matchingMetadata.COLLECTOR_CODE = authorObj.COLLECTOR_CODE;
    matchingMetadata.YEAR = authorObj.YEAR;
    matchingMetadata.COUNTRY = authorObj.COUNTRY;
    matchingMetadata.SPECIMEN_TYPE_STATUS = authorObj.SPECIMEN_TYPE_STATUS;
    matchingMetadata.IDENTIFIER = authorObj.IDENTIFIER;
    matchingMetadata.BIOMATERIAL_PROVIDER = authorObj.BIOMATERIAL_PROVIDER;
    matchingMetadata.VOUCHER_DETAILS_LINK = authorObj.VOUCHER_DETAILS_LINK;
    matchingMetadata.RAW_DATA_LINK = authorObj.RAW_DATA_LINK;
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
