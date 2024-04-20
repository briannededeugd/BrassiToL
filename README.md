## Brassicaceae Tree of Life

Welcome to the Github repository of the Brassicaceae Tree of Life: an interactive and informative website visualizing the Brassicaceae family according to the research of Kasper Hendriks of the Naturalis Biodiversity Center (Leiden, January 2024). This site was built in assignment of the Amsterdam University of Applied Sciences and Kasper Hendriks, for the minor Information Design, by Brianne de Deugd after the design by Robin Dekker and Roosmarijn Hoekstra.

### Application Architecture 
At the core of this application is Svelte, a framework that handles timing and user interaction as fast as can be, which results in a highly efficient and fast web application. Svelte's component-based architecture is ideal for the Brassicaceae project, as it allows for a modular and maintainable codebase. Each component is designed to be self-contained, managing its own state and behaviors, which simplifies the development process and enhances the application's overall performance.

#### D3 integration
D3.js is one of the most popular tools for visualizations, and it's no different in this environment. It is seamlessly integrated into the Brassicaceae Tree of Life application, and without it, the tree would not exist as it does now. The combination of Svelte's reactivity and D3's dynamic graphical tools enables the interactions and real-time visualizations of the Brassicaceae phylogenetic tree. This integration allows users to explore the complex dataset the tree is based on through intuitive and engaging graphical representations.

#### Reactive statements
Once you dive into the code behind the application, you'll inevitably run into countless reactive statements and await/async's. These statements ensure that the UI updates automatically and efficiently when the data changes, which is crucial in a data-intensive application like the Brassicaceae Tree of Life, where user interactions or data transformations necessitate immediate visual feedback.

#### Data transformation
Handling and transforming large datasets is efficiently addressed in every step of this project. I have implemented custom scripts that run once in the command line interface to transform data from CSV files into JavaScript-friendly formats (mostly JSON). This preprocessing step is vital for optimizing performance, as it enables quicker data rendering and manipulation within the Svelte and D3 environment. An example of this is the metadata csv-file, a huge information source about all nodes in the tree. To use this data in my code, I have translated this file to JSON, turned properties with multiple comma-separated values into arrays, linked information like 'countries' and 'geographical areas' to external datasets (such as the official landcodes to generate an accurate and interactive worldmap), and created relations between each node in the tree to the correct data in the file. Transforming the data to logical formats and useable endpoints was a big task that ultimately made the rest of the code more intuitive and logical.

#### Vite and Deployment
The creator of the Brassicaceae Tree of Life (and our 'client') Kasper Hendriks' biggest wish was for the tree to be interactive and reliably accessible to users worldwide. To achieve this and make that wish come true, I've made the choice to utilize the fast development environment of Vite, which significantly speeds up the development process. For deployment, the application is hosted on Vercel, which I've selected because of its easy use, scalability, and integration with our front-end framework, Svelte. By combining these, we ensure that the Brassicaceae Tree of Life is not only performant but also accessible to any and every user.

#### Conclusion
All in all, the structure of this Brassicaceae Tree of Life is steadfast and reliable. Web technologies like Svelte, D3, Vite and Vercel can be combined to put together a highly interactive, efficient, and beautiful application that visualizes complex data in a user-friendly manner. Both the scientific community, curious students and enthusiasts have all access to explore the interesting world of the Brassicaceae family!

### Installation
This application is online and accessible [here](https://brassitol.vercel.app/), but you can also run it in your local computer environment:

1. Download all contents of the repository from the [Code page](https://github.com/briannededeugd/BrassiToL);
2. You should find them in your `Downloads` folder. Create a new folder and name it `my-app`. Drag all of your downloaded content into `my-app`.
2. Open your Command Line Interface (Terminal);
3. Navigate to your Downloads folder using `cd Downloads` (meaning Change Directories to Downloads);<br>
3a. OPTIONAL: Type `pwd` to check what folder you're in. This should return Downloads.<br>
3b. OPTIONAL: Type `ls` to check the contents of your Downloads folder. This returns a list that should include `my-app`.<br>
4. Navigate to the `my-app` folder using `cd my-app` (meaning Change Directories to my-app);
5. Type `npm i` to install all necessary npm dependencies (pieces of other people's code the project depends on);
6. Type `npm run dev` to initialize the app. This should return `Running on localhost:[XXXX]`, in which `[XXXX]` is a four-digit number.
7. Open a browser (preferably FireFox, but Chrome works, too) and navigate to the address `localhost:[XXXX]` that was returned.

Now you should be able to view and use the application!

### Data Structure
As mentioned earlier, I have implemented custom scripts to transform the data in the background, even before the front-end was built. Since this is a one-time action, users won't need to run any additional scripts for the application to work.

*Data*
The main level of this application has two important folders, _src_ and _static_. _src_ includes all the pages and components. The latter are basically the visual building blocks that the page you see on your screen consists of and their logic. For example, there's the `PhyloTree.svelte` component, which loads the data, draws the tree and links the right fonts, colors, etc., while also declaring its functions like what happens when a user hovers over a node, or what happens to the tree when the user filters.

Now, we know that there was a metadata file. This is considered data, just like the `countries.json`-file and the `landcodes.json`-file. They're static files that store information. We call them static because a user's actions won't change them, and they're not like components that the user sees on their screen.

To illustrate the importance of how such a data-file is set up, I'll show you an example of an object in `metadata.json` and how that is used in a component. Below is the object for the 'Erucastrum gallicum', also known as the bracted rocket. This is just one object of many, so you can imagine how extensive and detailed this metadata is if it holds the information for hundreds of plants.

```json
{
        "SAMPLE": "S0317",
        "SPECIES_NAME_PRINT": "Erucastrum gallicum",
        "FAMILY": "Brassicaceae",
        "SUBFAMILY": "Brassicoideae",
        "SUPERTRIBE": "Brassicodae (II)",
        "TRIBE": "Brassiceae",
        "GENUS": "Erucastrum",
        "SPECIES": "gallicum",
        "DATASET": "BrassiWood/Kasper Hendriks",
        "powo_identifier": "283486-1",
        "gbif_identifier": "5375547",
        "WCVP_continent": "EUROPE",
        "WCVP_geographic_area": "W. & C. Europe",
        "WCVP_lifeform_description": [
            "annual",
            "perennial"
        ],
        "WCVP_climate_description": "temperate",
        "GROWTH_FORM": "H",
        "SOCIETAL_USE": "NA",
        "COMMON_NAME": "bracted rocket, common dog mustard, dog mustard, French rocket",
        "DUTCH_NAME": "Schijnraket",
        "GENUS_TYPE": "NA",
        "WCVP_WGSRPD_LEVEL_3_native": [
            "ALB",
            "AUT",
            "FRA",
            "GER",
            "ITA",
            "NET",
            "SPA",
            "SWI",
            "YUG"
        ],
        "WCVP_WGSRPD_LEVEL_1_native": "1"
    }
```

Since the metadata file was a CSV before, the data was not set up properly for coding. For example, you can see in this object that the property `WCVP_WGSRPD_LEVEL_3_native` contains an array of strings that represent the countries that the bracted rocket is native to, but in the original CSV file, this property looked like a cell that said "ALB, AUT, FRA, GER, ITA, NET, SPA, SWI, YUG" as text. So, this information needed to be transformed for me to be able to use each country individually.

Doing this for hundreds of objects by hand was not an option. That is why I created a custom script that could iterate over every object in the metadata for me and apply that change where it was necessary. Here's what that script looked like:

```js
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
```

In just a few steps, I'd been able to transform the data to what I needed it to be so that I could work with it! Of course, some transformations required several steps. As you can tell from the code, the countries weren't arrays yet, but in a separate script-file I managed to apply that modification, too. In total, the data transformation was completed with twelve custom scripts.

### Conclusion
A lot of work has gone into the creation of the Brassicaceae Tree of Life, and our greatest hope as a team is that this work and effort is palpable in the end result. In any way, I've grown a lot as a programmer and like my team members, the designers Robin Dekker and Roosmarijn Hoekstra, I'm very grateful to Kasper Hendriks at the Biodiversity Center of Naturalis for putting his trust in us. I've learned so much in just six short weeks and I couldn't be more proud of what it has brought forward. I hope many people around the world will enjoy the Brassicaceae Tree of Life that we have built for years to come.
