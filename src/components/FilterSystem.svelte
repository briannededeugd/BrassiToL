<script>
	import { onMount } from "svelte";
	import * as d3 from "d3";
	import "/static/fonts/fonts.css";
	import { selectedSpeciesStore } from "./store.js";

	// Newick String
	const newickString = `((((((((((8000070:4.293389,8008999:4.293389):0.018593,(S0720:2.345959,S0795:2.345959):1.966023):5.98108,((((S0279:3.34149,(S0834:3.221835,S0836:3.221835):0.119655):2.522857,(S0902:3.353279,(S1113:2.398427,S1121:2.398427):0.954852):2.511069):2.817814,S0281:8.682161):0.916235,(S0901:8.787712,((S1083:1.688128,S1498:1.688128):1.320665,SRR11470320:3.008794):5.778918):0.810684):0.694666):1.524258,((8009952:3.559647,(((S0419:1.852396,S0760:1.852396):0.140009,S0770:1.992405):0.055746,((S0765:1.441116,S1462:1.441116):0.270389,S1177:1.711505):0.336646):1.511496):1.932517,S0196:5.492165):6.325155):1.831978,SRR8528384:13.649298):3.656503,(S0717:9.888728,S0722:9.888728):7.417073):2.622755,((((((((((S0288:2.547617,(S1266:2.089441,(S1269:1.776775,S1409:1.776775):0.312667):0.458176):0.120632,S0430:2.668249):0.467667,S1249:3.135915):0.358419,(S0303:3.151017,(S0620:1.980522,S0748:1.980522):1.170495):0.343317):0.120873,((S0322:3.104655,S0724:3.104655):0.253383,S0355:3.358038):0.25717):5.315323,S0952:8.93053):2.670321,(S0308:10.642183,S1519:10.642183):0.958667):0.296412,S1111:11.897263):1.263404,(((S0616:5.672204,S0732:5.672204):0.480007,((S0739:1.190721,S1176:1.190721):0.619814,(S1229:1.60178,S1260:1.60178):0.208755):4.341675):6.420019,(((S0740:1.733788,S1120:1.733788):3.417605,S1262:5.151394):6.471992,((S0888:3.534584,S1315:3.534584):2.998334,(S1110:1.465213,S1210:1.465213):5.067705):5.090468):0.948843):0.588438):4.516849,S1374:17.677516):2.25104):0.527934,(((((((((((((((((((ERR2789774:4.45535,S0728:4.45535):0.096092,(S0949:2.684553,SRR8528342:2.684553):1.866889):0.894568,S1116:5.446011):0.143576,S0896:5.589587):0.122043,((S0285:5.324192,(((S0306:2.800319,S0946:2.800319):2.033249,S0741:4.833568):0.087734,S0895:4.921303):0.40289):0.033643,S1424:5.357836):0.353794):0.065832,S0947:5.777461):0.339933,(S0435:0.54075,S1400:0.54075):5.576645):0.047467,(S0509:6.01617,S0941:6.01617):0.148692):1.040146,(S1371:4.90643,SRR8528376:4.90643):2.298577):1.106115,((((((S0268:3.24201,(S0763:3.164576,S_670:3.164576):0.077434):0.101474,(S0282:3.250852,(S0293:3.205508,S0301:3.205508):0.045345):0.092632):0.054994,(S0400:3.230808,S0690:3.230808):0.16767):0.198272,(S1227:2.129024,S1369:2.129024):1.467726):0.437799,((S0405:2.840231,(S0643:2.698462,S1370:2.698462):0.141769):0.055483,(S1278:1.43191,S1279:1.43191):1.463804):1.138836):2.084093,(S0756:4.882739,SRR8528343:4.882739):1.235904):2.19248):1.096388,((S0641:4.802857,S1204:4.802857):1.6933,(S0670:4.766648,S0718:4.766648):1.729509):2.911352):1.601577,(((((S0316:6.564534,((S0809:3.739301,S1235:3.739301):0.680075,S1460:4.419376):2.145158):1.433167,S1318:7.997701):0.50831,S0721:8.50601):0.536276,SRR8528357:9.042287):0.957725,(S0612:0.201177,SRR8528350:0.201177):9.798835):1.009075):1.172095,(S1211:6.071902,S1381:6.071902):6.10928):0.646779,(((S0275:3.772578,S0383:3.772578):4.359388,S1052:8.131966):0.692957,((S0294:6.015405,(S0300:4.745501,S0764:4.745501):1.269904):0.867875,S0903:6.88328):1.941643):4.003037):0.645659,(S0055:6.354836,S1375:6.354836):7.118784):1.657665,(((S0412:8.85436,(S0742:6.497848,S1407:6.497848):2.356511):3.010364,(S0558:9.462661,S0762:9.462661):2.402063):2.162654,(S0689:8.62399,SRR8528359:8.62399):5.403388):1.103907):0.401417,(((S0547:3.036166,(S1181:2.997321,S1561:2.997321):0.038845):0.658307,S0591:3.694473):7.852503,S0751:11.546975):3.985726):0.803929,(((S0298:2.771257,S0671:2.771257):7.144849,(((S0376:4.776158,S0672:4.776158):4.280931,((S0893:6.488433,S1276:6.488433):1.357998,S1541:7.846431):1.210658):0.403748,(S0427:8.732103,(S0734:6.870865,SRR8528391:6.870865):1.861238):0.728735):0.455268):0.549786,(S0593:8.794837,S0733:8.794837):1.671054):5.870739):4.022471,((((((((((((((ERR4210213:6.114164,S0335:6.114164):0.180637,S0280:6.294801):0.01798,(S0629:4.500201,SRR8528380:4.500201):1.81258):0.456355,SRR8528365:6.769136):5.813544,(((((S0286:1.597668,S0521:1.597668):1.391476,(S1050:2.665309,S1258:2.665309):0.323835):0.476971,S1053:3.466116):4.79999,((((S0346:5.051979,((S0727:4.98299,S0759:4.98299):0.058315,S1072:5.041304):0.010675):0.015476,(S0647:2.835468,(S1040:2.218971,SRR8528388:2.218971):0.616497):2.231986):0.443162,(((((((S0754:2.462619,S1481:2.462619):0.037413,S1319:2.500032):0.093595,S1117:2.593627):0.009813,S1039:2.60344):0.012631,S1459:2.616071):0.101997,((S1044:1.658829,(S1097:1.003053,S1118:1.003053):0.655776):0.96618,(S1106:1.181513,S1464:1.181513):1.443496):0.09306):1.003406,(S1096:0.548041,S1098:0.548041):3.173434):1.789141):1.925596,(S0512:5.48837,S1417:5.48837):1.947842):0.829894):1.045974,(((S0345:6.202589,(SRR8528361:5.717686,SRR8528398:5.717686):0.484904):0.126831,SRR11470309:6.32942):0.227994,S1332:6.557414):2.754665):3.2706):0.540922,((((S0297:9.831898,((S0371:3.709191,S1270:3.709191):2.087271,S0768:5.796462):4.035435):1.161042,((((S0305:8.935844,(((S0315:2.735873,S0743:2.735873):1.042727,S0664:3.7786):3.26471,(S0726:5.584508,S1021:5.584508):1.458802):1.892534):0.477798,(((((((((S0317:5.358194,S0617:5.358194):0.789259,S0331:6.147453):0.675915,S0897:6.823368):0.389716,(S1208:2.935363,S1220:2.935363):4.277722):0.092857,S0662:7.305942):0.353085,(((S0323:5.645644,S0377:5.645644):1.072013,(((S0660:4.157692,S0752:4.157692):0.441155,S1421:4.598847):1.710005,S0667:6.308852):0.408804):0.470709,(((S0583:1.205446,S1408:1.205446):4.297312,(S0590:0.451577,S1509:0.451577):5.051181):0.731827,S0747:6.234585):0.953781):0.470661):0.354981,((S0326:4.543425,S1011:4.543425):1.821039,S1401:6.364464):1.649544):0.643051,S0731:8.657059):0.129921,(S0851:6.588755,S1314:6.588755):2.198224):0.626662):0.5419,((((S0380:6.855756,S1221:6.855756):1.132594,S0385:7.98835):0.540057,S1339:8.528407):0.821232,(S1331:6.106428,S1442:6.106428):3.243211):0.605903):0.452576,((((S0464:0.952625,S1168:0.952625):0.877213,S0954:1.829838):1.522881,(S0772:3.24226,S1506:3.24226):0.110459):4.249379,(S0669:5.056371,S1458:5.056371):2.545727):2.80602):0.584822):0.346866,S0373:11.339806):1.486503,(S1412:10.975562,SRR6441723:10.975562):1.850747):0.297292):0.321315,((SRR8528341:2.546203,SRR8528389:2.546203):10.825913,SRR8528386:13.372116):0.0728):0.509608,S1201:13.954524):2.251213,((((((S0292:2.422502,S1366:2.422502):0.416404,S1419:2.838905):0.962623,S1449:3.801528):2.381906,(S0381:5.181088,S1422:5.181088):1.002346):4.662442,(((S0384:10.079369,((S0738:6.815072,S0766:6.815072):2.342458,S0745:9.157529):0.921839):0.502008,((S1214:6.819964,SRR8528336:6.819964):0.742561,S1376:7.562525):3.018853):0.182622,S0744:10.763999):0.081878):3.822226,(S0416:0.684289,S1336:0.684289):13.983813):1.537634):0.503207,((S0312:4.139926,S0757:4.139926):2.733412,S1238:6.873337):9.835606):1.076516,((S0284:7.535173,SRR8528373:7.535173):9.368203,((((((S0552:5.280043,((S0758:4.012678,S0956:4.012678):0.781974,(S0960:3.852153,S0964:3.852153):0.942499):0.485391):0.862936,S0562:6.142979):2.323157,((S0613:2.010477,S1189:2.010477):4.498915,S0959:6.509391):1.956744):0.865977,(((S0677:1.900311,S1129:1.900311):0.959442,S1128:2.859752):5.171723,S0771:8.031475):1.300637):0.509232,S1103:9.841344):1.873695,SRR8528372:11.715039):5.188337):0.882084):0.431469,((S0906:3.078085,SRR8528379:3.078085):2.551818,SRR8528400:5.629903):12.587026):0.913853,S0283:19.130781):0.970174,(((((((S0156:6.043079,S0654:6.043079):4.708973,((S0403:5.575547,S1428:5.575547):0.996573,S1182:6.57212):4.179931):1.656943,((((S0436:4.914732,S0450:4.914732):4.470309,(S0655:4.745114,S1114:4.745114):4.639927):2.156348,(S0555:9.642375,S0642:9.642375):1.899015):0.151181,S0691:11.69257):0.716424):4.731652,S1354:17.140647):1.548346,((S0329:13.897214,(S0560:11.730406,SRR8528338:11.730406):2.166809):2.868609,((((S0746:2.718402,S1074:2.718402):2.983978,SRR8528399:5.70238):5.36664,S1077:11.06902):5.302862,SRR8528382:16.371882):0.393941):1.92317):0.542232,(S0688:11.457373,S0957:11.457373):7.773851):0.520795,((((((S0277:2.642806,(S0989:2.049367,(S1038:1.179584,S1043:1.179584):0.869783):0.593439):7.289574,(S1045:6.542772,S1488:6.542772):3.389607):4.920607,((S0753:10.17742,(S1093:6.199029,((S1102:1.098905,S1119:1.098905):2.994468,SRR8528364:4.093373):2.105656):3.97839):0.503251,((S1089:4.589716,SRR8528397:4.589716):0.803055,S1095:5.392771):5.287899):4.172315):0.816457,(SRR8528385:10.340694,SRR8528394:10.340694):5.328749):3.21174,((((S0420:0.442107,S1342:0.442107):1.484212,S1341:1.926319):14.918444,SRR8528356:16.844763):1.250348,SRR8528381:18.095111):0.786073):0.399366,(((((S0577:5.816616,S1107:5.816616):0.881428,(S1069:3.645595,S1213:3.645595):3.052449):4.831587,S0892:11.529631):5.3627,S1378:16.892331):0.566744,S1579:17.459075):1.821474):0.471471):0.348936):0.258145):0.097389):0.704041,(((((((((((((((((S0278:5.186402,S1251:5.186402):0.786598,S1241:5.973):0.500262,S0624:6.473263):0.464607,(S0299:6.617086,(S0421:3.865414,SRR8528347:3.865414):2.751673):0.320783):0.29119,S0645:7.229059):0.251141,(S0289:7.02979,((S0320:5.760759,S1451:5.760759):0.723553,S1230:6.484313):0.545478):0.45041):0.1753,S0424:7.6555):0.170988,((S0407:2.6885,S1475:2.6885):0.64135,S0963:3.329849):4.496638):0.293219,(S0951:5.665489,S1365:5.665489):2.454217):0.33753,(S0417:7.424537,S1239:7.424537):1.0327):0.313335,S0327:8.770572):0.288007,S1474:9.058579):0.394849,((S0428:5.941303,S1368:5.941303):0.398287,S1232:6.33959):3.113837):1.673083,S0478:11.12651):1.179782,(((S0656:6.119227,((((S0827:3.58945,S1234:3.58945):1.467748,SRR8528358:5.057198):0.436437,S1250:5.493634):0.583131,SRR8528354:6.076766):0.042461):0.273763,(S0657:4.942829,S0899:4.942829):1.450161):4.352156,S1405:10.745146):1.561147):0.681483,S1328:12.987776):1.444736,(((((S0673:4.805179,S1539:4.805179):0.405966,((S0894:2.768614,S1245:2.768614):0.268969,S1246:3.037583):2.173561):3.298678,SRR8528370:8.509822):0.710276,S0761:9.220098):3.070374,((S1187:3.6954,S1188:3.6954):1.909878,SRR8528339:5.605277):6.685195):2.142039):6.72802):3.386848,(((S0735:6.338364,(S1148:5.476328,(S1180:2.951234,S1223:2.951234):2.525095):0.862035):2.122316,((S0890:4.036171,S1100:4.036171):0.589165,S1184:4.625335):3.835345):6.915069,S1261:15.375749):9.17163);
`;
	// Parsing the Newick string
	const parsedData = parseNewick(newickString);

	function parseNewick(a) {
		for (
			var e = [], r = {}, s = a.split(/\s*(;|\(|\)|,|:)\s*/), t = 0;
			t < s.length;
			t++
		) {
			var n = s[t];
			switch (n) {
				case "(":
					var c = {};
					r.branchset = [c];
					e.push(r);
					r = c;
					break;
				case ",":
					var c = {};
					e[e.length - 1].branchset.push(c);
					r = c;
					break;
				case ")":
					r = e.pop();
					break;
				case ":":
					break;
				default:
					var h = s[t - 1];
					")" == h || "(" == h || "," == h
						? (r.name = n)
						: ":" == h && (r.length = parseFloat(n));
			}
		}
		return r;
	}

	// Simple 'capitalize every first letter'-function
	function capitalizeFirstLetter(string) {
		return string
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(" ");
	}

	/**============================================
	 *               Declaring Variables
	 *=============================================**/
	let metadata = [];
	let landcodes = [];

	// for filtering: taxonomy
	let subfamilies = [];
	let supertribes = [];
	let tribes = [];
	let genuses = [];
	let species = [];

	// for filtering: geography
	let geographicareas = [];
	let continents = [];
	let countries = [];

	// for filtering: characteristics
	let growthform = [];
	let societaluse = [];
	let lifeform = [];
	let climates = [];

	// for searching
	let autocompleteOpen = false;

	$: autocompleteOpen = searchAll.trim() !== "";

	let globalSearchResults = [];
	$: {
		globalSearchResults = globalFilterItems(searchAll);
	}

	function createCheckboxState(withAllSelected = false) {
		return withAllSelected ? { allSelected: false, items: [] } : { items: [] };
	}

	// checkbox states
	let checkboxStates = {
		// Taxonomy categories without 'allSelected'
		subfamilies: createCheckboxState(),
		supertribes: createCheckboxState(),
		tribes: createCheckboxState(),
		genuses: createCheckboxState(),
		species: createCheckboxState(),

		// Geography categories without 'allSelected'
		geographicareas: createCheckboxState(),
		continents: createCheckboxState(),
		countries: createCheckboxState(),

		// Characteristics categories with 'allSelected'
		growthForm: createCheckboxState(true),
		societaluse: createCheckboxState(true),
		lifeform: createCheckboxState(true),
		climates: createCheckboxState(true),
	};

	onMount(async () => {
		const response = await fetch("/BrassiToL_metadata.json");
		metadata = await response.json();
		console.log("METADATA", metadata);

		const landcodeResponse = await fetch("/BrassiToL_landcodes.json");
		landcodes = await landcodeResponse.json();
		console.log("LANDCODES", landcodes);

		/**======================
		 *    NEW SETS FOR FILTERING FAMILIES
		 *========================**/

		function processMetadataCategory(category, key) {
			const uniqueItems = new Set(
				metadata.map((item) => item[key]).filter((item) => item !== "NA")
			);

			const checkboxItems = Array.from(uniqueItems)
				.map((item) => ({
					// Use "SPECIES_NAME_PRINT" if category is "species", else use item (the value of the key property)
					label:
						category === "species"
							? metadata.find((x) => x[key] === item)?.SPECIES_NAME_PRINT ||
								item
							: item,
					value: item,
					checked: false,
				}))
				.sort((a, b) => a.label.localeCompare(b.label));

			checkboxStates[category].items = checkboxItems;
		}

		// Usage
		processMetadataCategory("subfamilies", "SUBFAMILY");

		processMetadataCategory("supertribes", "SUPERTRIBE");
		console.log(
			"WHEN FILTERING SUPERTRIBES:",
			checkboxStates.supertribes.items
		);
		processMetadataCategory("tribes", "TRIBE");
		processMetadataCategory("genuses", "GENUS");
		processMetadataCategory("species", "SPECIES");

		/**======================
		 *   NEW SETS FOR FILTERING GEOGRAPHY
		 *========================**/

		function processContinentCategory(category, geographyKey) {
			const processedContinents = new Set(
				metadata
					.map((item) => item[geographyKey])
					.filter((item) => item !== "NA")
			);

			const checkboxItems = Array.from(processedContinents)
				.map((continent) => ({
					label: capitalizeFirstLetter(continent),
					value: continent,
					checked: false,
				}))
				.sort((a, b) => a.label.localeCompare(b.label));

			checkboxStates[category].items = checkboxItems;
		}

		function processGeographicAreaCategory(category, metadata, landcodes) {
			const areaNameToCode = new Map();
			metadata
				.flatMap((item) => item.WCVP_WGSRPD_LEVEL_1_native || [])
				.filter((code) => code !== "NA")
				.forEach((code) => {
					const areaName = landcodes[code] ? landcodes[code].WGSRPD_name : code;
					areaNameToCode.set(areaName, code);
				});

			const checkboxItems = Array.from(areaNameToCode.keys()) // Use keys() to get area names
				.map((areaName) => ({
					label: areaName, // No need to convert to string, as areaName is already a string
					value: areaNameToCode.get(areaName),
					checked: false,
				}))
				.sort((a, b) => a.label.localeCompare(b.label));

			checkboxStates[category].items = checkboxItems;
		}

		function processCountryCategory(
			category,
			countryKey,
			isArrayOfValues = false
		) {
			const processedCountries = new Set(
				metadata.flatMap((item) => {
					const value = item[countryKey];
					return isArrayOfValues
						? Array.isArray(value)
							? value
							: [value]
						: [value];
				})
			);

			const checkboxItems = Array.from(processedCountries)
				.filter((countryCode) => countryCode !== "NA")
				.map((countryCode) => {
					const landcodeEntry = landcodes.find((lc) => lc.code === countryCode);
					const label = landcodeEntry ? landcodeEntry.WGSRPD_name : countryCode;

					return {
						label: label,
						value: countryCode,
						checked: false,
					};
				})
				.sort((a, b) => a.label.localeCompare(b.label));

			checkboxStates[category].items = checkboxItems;
		}

		processContinentCategory("continents", "WCVP_continent");
		processGeographicAreaCategory("geographicareas", metadata, landcodes);
		processCountryCategory("countries", "WCVP_WGSRPD_LEVEL_3_native", true);

		/**======================
		 *    NEW SETS FOR FILTERING CHARACTERISTICS
		 *========================**/
		function processCategory(
			categoryKey,
			metadataKey,
			isArrayOfValues = false
		) {
			const growthFormLabelMapping = {
				H: "Herbaceous",
				W: "Woody",
			};

			const processedItems = new Set(
				metadata.flatMap((item) => {
					const value = item[metadataKey];
					return isArrayOfValues
						? Array.isArray(value)
							? value
							: [value]
						: [value];
				})
			);

			const checkboxItems = Array.from(processedItems)
				.filter((item) => item !== "NA")
				.map((item) => {
					let label = item;
					if (metadataKey === "GROWTH_FORM") {
						label = growthFormLabelMapping[item] || item;
					} else {
						label = capitalizeFirstLetter(item);
					}
					return {
						label: label,
						value: item,
						checked: false,
					};
				})
				.sort((a, b) => a.label.localeCompare(b.label)); // Sort the items alphabetically by label

			checkboxStates[categoryKey].items = checkboxItems;
		}

		// Example usage
		processCategory("growthForm", "GROWTH_FORM");
		processCategory("societaluse", "SOCIETAL_USE", true);
		processCategory("lifeform", "WCVP_lifeform_description", true);
		processCategory("climates", "WCVP_climate_description");
	});

	/**============================================
	 *               FILTER SYSTEM
	 *=============================================**/

	//  TAXONOMY
	let taxonomyOpen = false;
	let geographyOpen = false;
	let characteristicsOpen = false;

	let searchFamily = "";
	let searchSubfamily = "";
	let searchSupertribe = "";
	let searchTribe = "";
	let searchGenus = "";
	let searchSpecies = "";

	let searchContinent = "";
	let searchGeographicArea = "";
	let searchCountries = "";

	let searchAll = "";

	function globalFilterItems(searchTerm) {
		searchTerm = searchTerm.trim().toLowerCase();
		let results = {};

		if (searchTerm === "") {
			return results;
		}

		const categories = {
			Subfamily: checkboxStates.subfamilies.items,
			Supertribe: checkboxStates.supertribes.items,
			Tribe: checkboxStates.tribes.items,
			Genus: checkboxStates.genuses.items,
			Species: checkboxStates.species.items,
			"Geographic Area": checkboxStates.geographicareas.items,
			Continent: checkboxStates.continents.items,
			Country: checkboxStates.countries.items,
			"Growth Form": checkboxStates.growthForm.items,
			"Societal Use": checkboxStates.societaluse.items,
			"Life Form": checkboxStates.lifeform.items,
			Climate: checkboxStates.climates.items,
		};

		Object.entries(categories).forEach(([categoryName, categoryItems]) => {
			const filteredItems = categoryItems.filter((item) =>
				item.label.toLowerCase().startsWith(searchTerm)
			);
			if (filteredItems.length > 0) {
				results[categoryName] = filteredItems;
			}
		});

		return results;
	}

	function filterItems(items, searchTerm) {
		searchTerm = searchTerm.trim().toLowerCase();
		if (searchTerm === "") {
			return items; // Return all items if search term is empty
		}
		return items
			.filter((item) => item.label.toLowerCase().startsWith(searchTerm))
			.sort((a, b) => {
				// Sort checked items to the top
				if (a.checked === b.checked) {
					return a.label.localeCompare(b.label); // Then alphabetically
				}
				return a.checked ? -1 : 1;
			});
	}

	function toggleSelectAll(category) {
		const allSelected = !checkboxStates[category].allSelected;
		checkboxStates = {
			...checkboxStates,
			[category]: {
				...checkboxStates[category],
				allSelected: allSelected,
				items: checkboxStates[category].items.map((item) => ({
					...item,
					checked: allSelected,
				})),
			},
		};

		updateTreeVisualization();
	}

	function handleCheckboxChange(category, itemLabel) {
		let item = [category].find((item) => item.label === itemLabel);
		if (item) {
			item.checked = !item.checked;
		}

		checkboxStates = {
			...checkboxStates,
			[category]: {
				...[category],
				items: [...[category]],
			},
		};

		// New logic for filtering and updating the tree
		updateTreeVisualization();
	}

	console.log("CHECKBOXSTATES:", checkboxStates);

	function handleGlobalSearchCheckboxChange(item) {
		// Find the item in its original category and update its checked state
		[
			subfamilies,
			supertribes,
			tribes,
			genuses,
			species,
			geographicareas,
			continents,
			countries,
			growthform,
			societaluse,
			lifeform,
			climates,
		].forEach((category) => {
			let categoryItem = category.find(
				(categoryItem) => categoryItem.label === item.label
			);
			if (categoryItem) {
				categoryItem.checked = item.checked;
			}
		});

		updateTreeVisualization();
	}

	function updateTreeVisualization() {
		console.log("CALLED FOR UPDATE");
		let selectedSpecies = new Set();
		Object.entries(checkboxStates).forEach(([category, state]) => {
			state.items.forEach((item) => {
				if (item.checked) {
					let property = getCategoryProperty(category);
					let value = item.value || item.label;
					let matchingItems = metadata.filter((metaItem) => {
						let dataValue = metaItem[property];
						return Array.isArray(dataValue)
							? dataValue.includes(value)
							: dataValue === value;
					});
					matchingItems.forEach((match) =>
						selectedSpecies.add(match.SPECIES_NAME_PRINT)
					);
				}
			});
		});

		console.log("SPECIES TEST:", selectedSpecies);
		selectedSpeciesStore.set(selectedSpecies);
	}

	function getCategoryProperty(category) {
		const categoryPropertyMap = {
			subfamilies: "SUBFAMILY",
			supertribes: "SUPERTRIBE",
			tribes: "TRIBE",
			genuses: "GENUS",
			species: "SPECIES",
			geographicareas: "WCVP_WGSRPD_LEVEL_1_native",
			continents: "WCVP_continent",
			countries: "WCVP_WGSRPD_LEVEL_3_native",
			growthForm: "GROWTH_FORM",
			societaluse: "SOCIETAL_USE",
			lifeform: "WCVP_lifeform_description",
			climates: "WCVP_climate_description",
		};
		return categoryPropertyMap[category] || null;
	}

	// Reactive statements for each category
	$: if (checkboxStates.continents.items.length > 0) {
		checkboxStates.continents.allSelected =
			checkboxStates.continents.items.every((item) => item.checked);
	}

	$: if (checkboxStates.geographicareas.items.length > 0) {
		checkboxStates.geographicareas.allSelected =
			checkboxStates.geographicareas.items.every((item) => item.checked);
	}

	$: if (checkboxStates.countries.items.length > 0) {
		checkboxStates.countries.allSelected = checkboxStates.countries.items.every(
			(item) => item.checked
		);
	}

	$: if (checkboxStates.growthForm.items.length > 0) {
		checkboxStates.growthForm.allSelected =
			checkboxStates.growthForm.items.every((item) => item.checked);
	}

	$: if (checkboxStates.societaluse.items.length > 0) {
		checkboxStates.societaluse.allSelected =
			checkboxStates.societaluse.items.every((item) => item.checked);
	}

	$: if (checkboxStates.lifeform.items.length > 0) {
		checkboxStates.lifeform.allSelected = checkboxStates.lifeform.items.every(
			(item) => item.checked
		);
	}

	$: if (checkboxStates.climates.items.length > 0) {
		checkboxStates.climates.allSelected = checkboxStates.climates.items.every(
			(item) => item.checked
		);
	}

	// Closing and opening filters logic

	function toggleTaxonomy() {
		taxonomyOpen = !taxonomyOpen;
		if (taxonomyOpen) {
			geographyOpen = false;
			characteristicsOpen = false;
			searchAll = ""; // Close autocomplete dropdown
		}
	}

	function toggleGeography() {
		geographyOpen = !geographyOpen;
		if (geographyOpen) {
			taxonomyOpen = false;
			characteristicsOpen = false;
			searchAll = ""; // Close autocomplete dropdown
		}
	}

	function toggleCharacteristics() {
		characteristicsOpen = !characteristicsOpen;
		if (characteristicsOpen) {
			taxonomyOpen = false;
			geographyOpen = false;
			searchAll = ""; // Close autocomplete dropdown
		}
	}

	$: if (autocompleteOpen) {
		taxonomyOpen = false;
		geographyOpen = false;
		characteristicsOpen = false;
	}
</script>

<section class="filtersystem">
	<!-- FILTER ON TAXONOMY -->
	<section class="dropdown-container">
		<!-- Filtering on taxonomy -->
		<button
			class="filtercategory {taxonomyOpen ? 'open' : ''}"
			on:click={toggleTaxonomy}
		>
			Taxonomy
			<span class="arrow"></span>
		</button>

		{#if taxonomyOpen}
			<div class="taxonomyDropdown">
				<!-- Subfamily -->
				<div class="filter">
					<h3>Subfamily</h3>
					<input
						type="text"
						placeholder="Search Subfamily"
						bind:value={searchSubfamily}
					/>
					<div class="checkbox-list">
						{#each filterItems(checkboxStates.subfamilies.items, searchSubfamily) as subfamily}
							<label>
								<input
									type="checkbox"
									bind:checked={subfamily.checked}
									on:change={() =>
										handleCheckboxChange(
											checkboxStates.subfamilies.items,
											subfamily.label
										)}
									value={subfamily}
								/>
								{subfamily.label}
							</label>
						{/each}
					</div>
				</div>

				<!-- Supertribe -->
				<div class="filter">
					<h3>Supertribe</h3>
					<input
						type="text"
						placeholder="Search Supertribe"
						bind:value={searchSupertribe}
					/>
					<div class="checkbox-list">
						{#each filterItems(checkboxStates.supertribes.items, searchSupertribe) as supertribe}
							<label>
								<input
									type="checkbox"
									bind:checked={supertribe.checked}
									on:change={() =>
										handleCheckboxChange(
											checkboxStates.supertribes.items,
											supertribe.label
										)}
									value={supertribe}
								/>
								{supertribe.label}
							</label>
						{/each}
					</div>
				</div>

				<!-- Tribe -->
				<div class="filter">
					<h3>Tribe</h3>
					<input
						type="text"
						placeholder="Search Tribe"
						bind:value={searchTribe}
					/>
					<div class="checkbox-list">
						{#each filterItems(checkboxStates.tribes.items, searchTribe) as tribe}
							<label>
								<input
									type="checkbox"
									bind:checked={tribe.checked}
									on:change={() =>
										handleCheckboxChange(
											checkboxStates.tribes.items,
											tribe.label
										)}
									value={tribe}
								/>
								{tribe.label}
							</label>
						{/each}
					</div>
				</div>

				<!-- Genus -->
				<div class="filter">
					<h3>Genus</h3>
					<input
						type="text"
						placeholder="Search Genus"
						bind:value={searchGenus}
					/>
					<div class="checkbox-list">
						{#each filterItems(checkboxStates.genuses.items, searchGenus) as genus}
							<label>
								<input
									type="checkbox"
									bind:checked={genus.checked}
									on:change={() =>
										handleCheckboxChange(
											checkboxStates.genuses.items,
											genus.label
										)}
									value={genus}
								/>
								{genus.label}
							</label>
						{/each}
					</div>
				</div>

				<!-- Species -->
				<div class="filter">
					<h3>Species</h3>
					<input
						type="text"
						placeholder="Search Species"
						bind:value={searchSpecies}
					/>
					<div class="checkbox-list">
						{#each filterItems(checkboxStates.species.items, searchSpecies) as specie}
							<label>
								<input
									type="checkbox"
									bind:checked={specie.checked}
									on:change={() =>
										handleCheckboxChange(
											checkboxStates.species.items,
											specie.label
										)}
									value={specie}
								/>
								{specie.label}
							</label>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</section>

	<!-- FILTER ON GEOGRAPHY -->
	<section class="dropdown-container">
		<!-- Filtering on geography -->
		<button
			class="filtercategory {geographyOpen ? 'open' : ''}"
			on:click={toggleGeography}
		>
			Geography
			<span class="arrow"></span>
		</button>
		{#if geographyOpen}
			<div class="geographyDropdown">
				<!-- CONTINENTS -->
				<div class="filter">
					<h3>Botanical Continents</h3>
					<input
						type="text"
						placeholder="Search Botanical Continent"
						bind:value={searchContinent}
					/>
					<div class="checkbox-list">
						{#each filterItems(checkboxStates.continents.items, searchContinent) as continent}
							<label>
								<input
									type="checkbox"
									bind:checked={continent.checked}
									on:change={() =>
										handleCheckboxChange(
											checkboxStates.continents.items,
											continent.label
										)}
								/>
								{continent.label}
							</label>
						{/each}
					</div>
				</div>

				<!-- GEOGRAPHIC AREA -->
				<div class="filter">
					<h3>Regions</h3>
					<input
						type="text"
						placeholder="Search Geographic Area"
						bind:value={searchGeographicArea}
					/>
					<div class="checkbox-list">
						{#each filterItems(checkboxStates.geographicareas.items, searchGeographicArea) as geographicarea}
							<label>
								<input
									type="checkbox"
									bind:checked={geographicarea.checked}
									on:change={() =>
										handleCheckboxChange(
											checkboxStates.geographicareas.items,
											geographicarea.label
										)}
									value={geographicarea.label}
								/>
								{geographicarea.label}
							</label>
						{/each}
					</div>
				</div>

				<!-- COUNTRIES -->
				<div class="filter">
					<h3>Botanical Countries</h3>
					<input
						type="text"
						placeholder="Search Botanical Countries"
						bind:value={searchCountries}
					/>
					<div class="checkbox-list">
						{#each filterItems(checkboxStates.countries.items, searchCountries) as country}
							<label>
								<input
									type="checkbox"
									bind:checked={country.checked}
									on:change={() =>
										handleCheckboxChange(
											checkboxStates.countries.items,
											country.label
										)}
								/>
								{country.label}
							</label>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</section>

	<!-- FILTER ON CHARACTERISTICS -->
	<section class="dropdown-container">
		<!-- Filtering on characteristics -->
		<button
			class="filtercategory {characteristicsOpen ? 'open' : ''}"
			on:click={toggleCharacteristics}
		>
			Characteristics<span class="arrow"></span></button
		>
		{#if characteristicsOpen}
			<div class="characteristicsDropdown">
				<!-- GROWTH FORM -->
				<div class="filter">
					<h3>Growth Form</h3>
					<div class="checkbox-list">
						<label>
							<input
								type="checkbox"
								bind:checked={checkboxStates.growthForm.allSelected}
								on:change={() => toggleSelectAll("growthForm")}
							/>
							{#if checkboxStates.growthForm.allSelected}
								Deselect All
							{:else}
								Select All
							{/if}
						</label>
						{#each checkboxStates.growthForm.items as item}
							<label>
								<input
									type="checkbox"
									bind:checked={item.checked}
									on:change={() =>
										handleCheckboxChange(
											checkboxStates.growthForm.items,
											item.label
										)}
								/>
								{item.label}
							</label>
						{/each}
					</div>
				</div>

				<!-- SOCIETAL USE -->
				<div class="filter">
					<h3>Societal Use</h3>
					<div class="checkbox-list">
						<label>
							<input
								type="checkbox"
								bind:checked={checkboxStates.societaluse.allSelected}
								on:change={() => toggleSelectAll("societaluse")}
							/>
							{#if checkboxStates.societaluse.allSelected}
								Deselect All
							{:else}
								Select All
							{/if}
						</label>
						{#each checkboxStates.societaluse.items as item}
							<label>
								<input
									type="checkbox"
									bind:checked={item.checked}
									on:change={() =>
										handleCheckboxChange(
											checkboxStates.societaluse.items,
											item.label
										)}
								/>
								{item.label}
							</label>
						{/each}
					</div>
				</div>

				<!-- LIFE FORM -->
				<div class="filter">
					<h3>Life Form</h3>
					<div class="checkbox-list">
						<label>
							<input
								type="checkbox"
								bind:checked={checkboxStates.lifeform.allSelected}
								on:change={() => toggleSelectAll("lifeform")}
							/>
							{#if checkboxStates.lifeform.allSelected}
								Deselect All
							{:else}
								Select All
							{/if}
						</label>
						{#each checkboxStates.lifeform.items as item}
							<label>
								<input
									type="checkbox"
									bind:checked={item.checked}
									on:change={() =>
										handleCheckboxChange(
											checkboxStates.lifeform.items,
											item.label
										)}
								/>
								<span>{item.label}</span>
							</label>
						{/each}
					</div>
				</div>

				<!-- CLIMATE -->
				<div class="filter">
					<h3>Climates</h3>
					<div class="checkbox-list">
						<label>
							<input
								type="checkbox"
								bind:checked={checkboxStates.climates.allSelected}
								on:change={() => toggleSelectAll("climates")}
							/>
							{#if checkboxStates.climates.allSelected}
								Deselect All
							{:else}
								Select All
							{/if}
						</label>
						{#each checkboxStates.climates.items as item}
							<label>
								<input
									type="checkbox"
									bind:checked={item.checked}
									on:change={() =>
										handleCheckboxChange(
											checkboxStates.climates.items,
											item.label
										)}
								/>
								<span>{item.label}</span>
							</label>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</section>

	<!-- SEARCH -->
	<section class="dropdown-container">
		<input type="text" placeholder="Search" bind:value={searchAll} />

		{#if searchAll.trim() !== ""}
			<div class="autocomplete-dropdown">
				{#if Object.keys(globalSearchResults).length === 0}
					<p>No results for your search</p>
				{:else}
					{#each Object.keys(globalSearchResults) as categoryName}
						<h3>{categoryName}</h3>
						{#each globalSearchResults[categoryName] as result}
							<label>
								<input
									type="checkbox"
									bind:checked={result.checked}
									on:change={() => handleGlobalSearchCheckboxChange(result)}
								/>
								{result.label}
							</label>
						{/each}
					{/each}
				{/if}
			</div>
		{/if}
	</section>
</section>

<style>
	h3 {
		font-family: Arial, Helvetica, sans-serif;
		font-size: 0.85em;
	}

	/***********************************/
	/*    FILTER SYSTEM GLOBAL STYLE   */
	/***********************************/

	.filtersystem {
		position: relative;
		display: flex;
		gap: 2em;
	}

	.filtersystem > .dropdown-container:last-of-type input[type="text"] {
		font-family: "Bayon", sans-serif;
		font-size: 1.5em;
		color: black;
		position: relative;
		display: flex;
		background: transparent;
		border: none;
		width: 15vw;
		margin-left: 2em;
		text-align: left;
		justify-content: space-between;
		align-items: center;
		transition: all 0.3s;
		color: #e1e1e1;
	}

	.filtersystem
		> .dropdown-container:last-of-type
		input[type="text"]:focus::placeholder {
		color: white;
		border: none;
	}

	input[type="text"]:focus {
		outline: none;
	}

	/* ************************* */
	/* CATEGORY DROPDOWN BUTTONS */
	/* ************************* */

	.filtercategory {
		font-family: "Bayon", sans-serif;
		font-size: 1.5em;
		color: black;
		position: relative;
		display: flex;
		background: transparent;
		border: none;
		width: 15vw;
		text-align: left;
		justify-content: space-between;
		align-items: center;
		transition: all 0.3s;
		color: #e1e1e1;
	}

	.filtercategory:hover {
		cursor: pointer;
		color: #729a68;
	}

	.filtercategory:active {
		color: #729a68;
	}

	/*****************/
	/*    DROPDOWNS  */
	/*****************/

	.taxonomyDropdown {
		position: absolute;
		left: 0;
	}

	.taxonomyDropdown,
	.geographyDropdown,
	.characteristicsDropdown {
		display: flex;
		position: absolute;
		min-width: max-content;
		max-height: 30vh;
		top: 3.5em;
		overflow-y: hidden;
		padding: 1em 1em 3em;
		gap: 4vw;
		color: #e1e1e1;

		background-color: #0d1c1bc5;
		backdrop-filter: blur(5px);
		border: none;
		border-radius: 0 0 10px 10px;
	}

	.autocomplete-dropdown {
		display: flex;
		flex-direction: column;
		position: absolute;
		max-height: 30vh;
		width: 15.5vw;
		top: 3.5em;
		margin-left: 2em;
		overflow-y: auto;
		padding: 1em;
		gap: 0;
		color: #e1e1e1;

		background-color: #0d1c1bc5;
		backdrop-filter: blur(5px);
		border: none;
		border-radius: 0 0 10px 10px;
	}

	.characteristicsDropdown {
		gap: 0 !important;
	}

	/* Geographical dropdown */
	.geographyDropdown .filter {
		min-width: 12vw;
	}

	.geographyDropdown input[type="text"] {
		min-width: 90%;
	}

	/* Characteristics dropdown */
	.characteristicsDropdown .filter:nth-of-type(1),
	.characteristicsDropdown .filter:nth-of-type(2) {
		margin-right: 4vw;
	}

	.characteristicsDropdown .filter:nth-of-type(3) {
		max-width: 9vw;
	}

	.characteristicsDropdown .filter:nth-of-type(4) {
		max-width: 8vw;
	}

	.characteristicsDropdown .filter:nth-of-type(3) .checkbox-list label,
	.characteristicsDropdown .filter:nth-of-type(4) .checkbox-list label {
		display: flex;
		align-items: flex-start;
		margin-bottom: 5px;
	}

	.characteristicsDropdown
		.filter:nth-of-type(3)
		.checkbox-list
		input[type="checkbox"],
	.characteristicsDropdown
		.filter:nth-of-type(4)
		.checkbox-list
		input[type="checkbox"] {
		margin-right: 5px;
	}

	.characteristicsDropdown .filter:nth-of-type(3) .checkbox-list span,
	.characteristicsDropdown .filter:nth-of-type(4) .checkbox-list span {
		flex: 1;
		text-align: left;
		margin-left: 1px;
	}

	/* ************** */
	/* CHECHBOX LISTS */
	/* ************** */

	.checkbox-list {
		display: flex;
		flex-direction: column;
		height: 20vh;
		overflow-y: auto;
		padding-bottom: 1em;
	}

	.checkbox-list label,
	.autocomplete-dropdown label,
	.autocomplete-dropdown p {
		font-family: Arial, Helvetica, sans-serif;
		display: block;
		margin-bottom: 5px;
		font-size: 12px;
		color: #e1e1e1;
	}

	.characteristicsDropdown .checkbox-list label:first-of-type {
		order: -9999;
	}

	.checkbox-list label:has(input:checked) {
		order: -9998;
	}

	.taxonomyDropdown > div > input[type="text"],
	.geographyDropdown > div > input[type="text"] {
		background-color: #e9e9e9;
		border: none;
		border-radius: 5px;
		height: 2.5vh;
		width: 10vw;
		margin: auto 0.2em 0.75em;
		padding-left: 1em;
		background-image: url("/static/img/magnifyingglass-small.png"); /* Path to your icon */
		background-size: 15px 15px; /* Size of your icon */
		background-position: right 1em center; /* Position of your icon */
		background-repeat: no-repeat;
	}

	.taxonomyDropdown > div > input[type="text"]::placeholder,
	.geographyDropdown > div > input[type="text"]::placeholder {
		font-style: italic;
		color: #252525;
		font-size: 0.8em;
	}

	.checkbox-list label input[type="checkbox"] {
		border: 1px solid black;
	}
</style>
