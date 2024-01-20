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
	let selectedSpecies;
	let supertribes = [];
	let colorScale;

	let fullSpeciesName;
	let familyName;
	let subfamilyName;
	let supertribeName;
	let tribeName;
	let genusName;
	let speciesName;
	let lifeformName;
	let climateName;
	let growthformName;
	let societaluseName;
	let imageId;

	let mounted = false;
	let treeData;
	const width = 900;
	const outerRadius = width / 2;
	const innerRadius = outerRadius - 170;

	/**=========================================================
	 *     onMount: What's being built when the page is loaded
	 *=========================================================**/
	onMount(async () => {
		const response = await fetch("/static/BrassiToL_metadata.json");
		metadata = await response.json();
		console.log("METADATA", metadata);

		const landcodeResponse = await fetch("/static/BrassiToL_landcodes.json");
		landcodes = await landcodeResponse.json();
		console.log("LANDCODES", landcodes);

		const uniqueItems = new Set(
			metadata.map((item) => item.SUPERTRIBE).filter((item) => item !== "NA")
		);
		supertribes = [...uniqueItems];
		console.log("ALL SUPERTRIBES:", supertribes);

		colorScale = d3
			.scaleOrdinal()
			.domain(supertribes)
			.range([
				"#0f72b2",
				"#cc79a7",
				"#169e73",
				"#d55e00",
				"#56b4e9",
				"#e69f01",
			]);

		mounted = true;

		const svg = createPhylogeneticTree(parsedData);
		const container = document.querySelector("#phyloTree");

		if (container) {
			container.appendChild(svg);
		} else {
			console.error("Container not found");
		}

		// For filtering
		selectedSpeciesStore.subscribe((value) => {
			selectedSpecies = value;
			updateTreeColors(selectedSpecies);
		});
	});

	/**========================================================================
	 *                           BUILDING THE CHART
	 *========================================================================**/

	/**============================================
	 *               Functions for labels
	 *=============================================**/
	// Extract the sample ID from the Newick string
	function extractSampleId(label) {
		const match = label.match(/^([^:]+)/); // This regex captures everything before the first colon
		return match ? match[1] : label; // Return the captured group if it exists, otherwise return the whole label
	}

	// Find the species name from the ID
	function findSpecies(label, metadata) {
		let sampleId = label; // Extract the SAMPLE id from the label
		let matchingEntry = metadata.find((item) => item.SAMPLE === sampleId);

		// Function to get the first non-NA taxonomic category
		function getTaxonomicCategory(entry) {
			if (entry.SPECIES !== "NA") return entry.SPECIES;
			if (entry.GENUS !== "NA") return entry.GENUS;
			if (entry.TRIBE !== "NA") return entry.TRIBE;
			if (entry.SUPERTRIBE !== "NA") return entry.SUPERTRIBE;
			if (entry.SUBFAMILY !== "NA") return entry.SUBFAMILY;
			return null;
		}

		if (matchingEntry) {
			const taxonomicCategory = getTaxonomicCategory(matchingEntry);
			return taxonomicCategory
				? capitalizeFirstLetter(taxonomicCategory)
				: capitalizeFirstLetter(label);
		} else {
			sampleId = label.slice(1); // Remove the first character (":")
			matchingEntry = metadata.find((item) => item.SAMPLE === sampleId);

			if (matchingEntry) {
				const taxonomicCategory = getTaxonomicCategory(matchingEntry);
				return taxonomicCategory
					? capitalizeFirstLetter(taxonomicCategory)
					: capitalizeFirstLetter(label);
			} else {
				return "";
			}
		}
	}

	function findFullSpecies(label, metadata) {
		console.log("Let's find em!");
		let sampleId = label; // Extract the SAMPLE id from the label
		console.log("THEE LABEL:", sampleId);
		let matchingEntry = metadata.find((item) => item.SAMPLE === sampleId);
		console.log("THEE MATCHES:", matchingEntry);

		// Function to get the first non-NA taxonomic category
		function getTaxonomicCategory(entry) {
			if (entry.SPECIES_NAME_PRINT !== "NA") return entry.SPECIES_NAME_PRINT;
			// return null;
		}

		if (matchingEntry) {
			const taxonomicCategory = getTaxonomicCategory(matchingEntry);
			return taxonomicCategory;
		} else {
			sampleId = label.slice(1); // Remove the first character (":")
			matchingEntry = metadata.find((item) => item.SAMPLE === sampleId);

			if (matchingEntry) {
				const taxonomicCategory = getTaxonomicCategory(matchingEntry);
				return taxonomicCategory
					? capitalizeFirstLetter(taxonomicCategory)
					: capitalizeFirstLetter(label);
			} else {
				return "";
			}
		}
	}

	function findSpeciesName(label, metadata) {
		let sampleId = extractSampleId(label); // Extract the SAMPLE id from the label
		let matchingEntry = metadata.find((item) => item.SAMPLE === sampleId);

		// Function to get the first non-NA taxonomic category
		function getTaxonomicCategory(entry) {
			if (entry.SPECIES_NAME_PRINT !== "NA") return entry.SPECIES_NAME_PRINT;
			return null;
		}

		if (matchingEntry) {
			const taxonomicCategory = getTaxonomicCategory(matchingEntry);
			return taxonomicCategory;
		} else {
			sampleId = label.slice(1); // Remove the first character (":")
			matchingEntry = metadata.find((item) => item.SAMPLE === sampleId);

			if (matchingEntry) {
				const taxonomicCategory = getTaxonomicCategory(matchingEntry);
				return taxonomicCategory;
			} else {
				return "";
			}
		}
	}

	/**============================================
	 *               Functions for creating
	 *=============================================**/

	let sharedRoot;
	// Draw the phylogenetic tree
	const createPhylogeneticTree = (data) => {
		let root = d3
			.hierarchy(data, (d) => d.branchset)
			.sum((d) => (d.branchset ? 0 : 1))
			.sort(
				(a, b) =>
					a.value - b.value || d3.ascending(a.data.length, b.data.length)
			);

		cluster(root);
		setRadius(root, (root.data.length = 0), innerRadius / maxLength(root));
		if (colorScale) {
			setColor(root);
		}

		// function handleZoom(e) {
		// 	d3.select("svg").attr("transform", e.transform);
		// }
		// let zoom = d3.zoom().on("zoom", handleZoom).scaleExtent([1, 5]);

		sharedRoot = root;

		// d3.select("#svg-container").call(zoom);

		const svg = d3
			.create("svg")
			.attr("viewBox", [-outerRadius, -375, width, width])
			.attr("font-family", "sans-serif")
			.attr("font-size", 10);

		svg.append("style").text(`
			.link--active {
  				stroke: #000 !important;
  				stroke-width: 1.5px;
			}

			.link--inactive {
  				stroke: #1F3035 !important;
			}

			.link-extension--active {
  				stroke-opacity: .6;
			}

			.label--active {
  				font-weight: bold;
			}
		`);

		const linkExtension = svg
			.append("g")
			.attr("fill", "none")
			.attr("stroke", "#E1E1E1")
			.attr("stroke-opacity", 0.25)
			.selectAll("path")
			.data(root.links().filter((d) => !d.target.children))
			.join("path")
			.each(function (d) {
				d.target.linkExtensionNode = this;
			})
			.attr("d", linkExtensionConstant);

		const link = svg
			.append("g")
			.attr("fill", "none")
			.attr("stroke", "#E1E1E1")
			.selectAll("path")
			.data(root.links())
			.join("path")
			.attr("class", "link")
			.each(function (d) {
				d.target.linkNode = this;
			})
			.attr("d", linkVariable);

		svg
			.append("g")
			.selectAll("text")
			.data(root.leaves())
			.join("text")
			.attr("dy", ".31em")
			.style("font-size", "5px")
			.style("fill", (d) => findSuperTribeColor(d.data.name))
			.style("cursor", "pointer")
			.attr(
				"transform",
				(d) =>
					`rotate(${d.x - 90}) translate(${innerRadius + 4},0)${
						d.x < 180 ? "" : " rotate(180)"
					}`
			)
			.attr("text-anchor", (d) => (d.x < 180 ? "start" : "end"))
			.text((d) => findSpeciesName(d.data.name, metadata))
			.on("mouseover", mouseovered(true))
			.on("mouseout", mouseovered(false))
			.each(function (d) {
				d.data.textNode = this;
			});

		function update(checked) {
			const t = d3.transition().duration(750);
			linkExtension
				.transition(t)
				.attr("d", checked ? linkExtensionVariable : linkExtensionConstant);
			link.transition(t).attr("d", checked ? linkVariable : linkConstant);
		}

		// Create the defaultstate of the tooltip
		let tooltip = d3.select("#tooltip");

		function mouseovered(active) {
			return function (event, d) {
				let superTribeColor = findSuperTribeColor(d.data.name);

				// FINDING INFO
				let metadataObject = metadata.find(
					(item) => item.SAMPLE === d.data.name
				);

				// Capitalizing array items as well as strings
				function formatDescription(description) {
					if (Array.isArray(description)) {
						// If it's an array, apply the function to each element
						return description.map((item) => capitalizeFirstLetter(item));
					} else if (typeof description === "string" && description !== "NA") {
						// If it's a string and not "NA", capitalize the first letter
						return capitalizeFirstLetter(description);
					}
					return description; // Return as is if none of the above conditions are met
				}

				// Making sure the meaning of each growth type appears instead of its short counterpart
				const growthFormLabelMapping = {
					H: "Herbaceous",
					W: "Woody",
				};

				fullSpeciesName = metadataObject.SPECIES_NAME_PRINT;
				familyName = metadataObject.FAMILY;
				subfamilyName = metadataObject.SUBFAMILY;
				supertribeName = metadataObject.SUPERTRIBE;
				tribeName = metadataObject.TRIBE;
				genusName = metadataObject.GENUS;
				speciesName = metadataObject.SPECIES;
				lifeformName = formatDescription(
					metadataObject.WCVP_lifeform_description
				);
				climateName = formatDescription(
					metadataObject.WCVP_climate_description
				);
				growthformName = growthFormLabelMapping[metadataObject.GROWTH_FORM];
				societaluseName = metadataObject.SOCIETAL_USE;
				imageId = metadataObject.powo_identifier;

				// Apply the active class to the hovered label and remove from others
				d3.selectAll("text").classed("label--active", false); // Remove active class from all
				d3.select(this).classed("label--active", active);

				if (active) {
					tooltip
						.style("visibility", "visible")
						.style("top", "20vh")
						.style("right", "5vw");

					/**====================
					 *     TREE EDITS
					 *===================**/

					// Change the color of all links and labels to grey
					svg.selectAll(".link").attr("stroke", "#1F3035");
					svg.selectAll("text").style("fill", "#1F3035");

					// Now highlight the path and label of the hovered node
					let currentNode = d;
					do {
						d3.select(currentNode.linkNode)
							.attr("stroke", superTribeColor)
							.raise();

						if (!currentNode.children) {
							// If it's a leaf node
							d3.select(currentNode.data.textNode).style(
								"fill",
								superTribeColor
							);
						}

						currentNode = currentNode.parent;
					} while (currentNode);
				} else {
					tooltip.style("visibility", "hidden");

					d3.select(d.linkNode).attr("stroke", "#E1E1E1"); // Reset the path color
					if (!d.children) {
						d3.select(d.data.textNode).style("fill", superTribeColor); // Reset the label color
					}

					// Re-apply the filter settings to the rest of the tree
					updateTreeColors(selectedSpecies);
				}
			};
		}

		var legendSvg = d3.select("#legend-container").append("svg");
		var legend = legendSvg
			.append("g")
			.attr("class", "legend")
			.attr("transform", "translate(20, 20)");

		// Create one group per color in the colorScale
		const legendItem = legend
			.selectAll(".legend-item")
			.data(colorScale.domain())
			.enter()
			.append("g")
			.attr("class", "legend-item")
			.attr("transform", function (d, i) {
				return "translate(0," + i * 17.5 + ")";
			});

		// Append a colored rectangle to each legend item
		legendItem
			.append("rect")
			.attr("width", 15)
			.attr("height", 15)
			.style("fill", colorScale);

		// Append text to each legend item
		legendItem
			.append("text")
			.style("font-size", ".85em")
			.attr("x", 24)
			.attr("y", 7)
			.attr("dy", ".35em")
			.style("text-anchor", "start")
			.style("fill", "#E1E1E1")
			.text(function (d) {
				return d;
			});

		return Object.assign(svg.node(), { update });
	};

	// Chart functions
	let cluster = d3
		.cluster()
		.size([360, innerRadius])
		.separation((a, b) => 1);

	// Set the radius of each node by recursively summing and scaling the distance from the root
	let setRadius = (d, y0, k) => {
		d.radius = (y0 += d.data.length) * k;
		if (d.children) d.children.forEach((d) => setRadius(d, y0, k));
	};

	// Compute the maximum cumulative length of any node in the tree.
	let maxLength = (d) => {
		return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
	};

	/**======================
	 *    SET COLORS
	 *========================**/

	function findSuperTribe(nodeLabel, metadata) {
		let foundItem = metadata.find(function (item) {
			return item.SAMPLE === nodeLabel;
		});
		let superTribe;
		if (foundItem !== undefined) {
			superTribe = foundItem.SUPERTRIBE;
		} else {
			superTribe = "Unplaced";
		}
		return superTribe;
	}

	// dark blue, light blue, green, red, pink, yellow

	let setColor = (d) => {
		let superTribe = findSuperTribe(d.data.name, metadata);
		d.color = superTribe
			? colorScale(superTribe)
			: d.parent
				? d.parent.color
				: null;
		if (d.children) d.children.forEach(setColor);
	};

	let linkExtensionConstant = (d) => {
		return linkStep(d.target.x, d.target.y, d.target.x, innerRadius);
	};

	let linkStep = (startAngle, startRadius, endAngle, endRadius) => {
		const c0 = Math.cos((startAngle = ((startAngle - 90) / 180) * Math.PI));
		const s0 = Math.sin(startAngle);
		const c1 = Math.cos((endAngle = ((endAngle - 90) / 180) * Math.PI));
		const s1 = Math.sin(endAngle);
		return (
			"M" +
			startRadius * c0 +
			"," +
			startRadius * s0 +
			(endAngle === startAngle
				? ""
				: "A" +
					startRadius +
					"," +
					startRadius +
					" 0 0 " +
					(endAngle > startAngle ? 1 : 0) +
					" " +
					startRadius * c1 +
					"," +
					startRadius * s1) +
			"L" +
			endRadius * c1 +
			"," +
			endRadius * s1
		);
	};

	let linkConstant = (d) => {
		return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
	};

	let linkVariable = (d) => {
		return linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius);
	};

	/**========================================================================
	 *                           UPDATING TREE BASED ON FILTERS
	 *========================================================================**/

	function updateTreeColors(speciesSet) {
		console.log("UPDATE COLOR FUNCTION CALLED");

		// Set the initial color of all labels and paths
		sharedRoot.each((node) => {
			let superTribeColor = findSuperTribeColor(node.data.name);

			// Set the path color to a uniform color (e.g., black)
			d3.select(node.linkNode).attr("stroke", superTribeColor);
			node.ancestors().forEach((ancestor) => {
				d3.select(ancestor.linkNode).attr("stroke", superTribeColor);
			});

			// Set the text color based on superTribe
			if (!node.children) {
				d3.select(node.data.textNode).style("fill", superTribeColor);
			}
		});

		// If species are selected, update colors accordingly
		if (speciesSet.size > 0) {
			sharedRoot.each((node) => {
				const speciesName = findFullSpecies(node.data.name, metadata);
				const isSpeciesSelected = speciesSet.has(speciesName);

				if (isSpeciesSelected) {
					let superTribeColor = findSuperTribeColor(node.data.name);
					// Propagate the superTribe color to all ancestors up to the root
					node.ancestors().forEach((ancestor) => {
						d3.select(ancestor.linkNode).attr("stroke", superTribeColor);

						// Ensure the text color for leaf nodes matches superTribe color
						if (!ancestor.children) {
							d3.select(ancestor.data.textNode).style("fill", superTribeColor);
						}
					});
				} else {
					// Dim the path and label of unselected nodes
					d3.select(node.linkNode).attr("stroke", "#1F3035");
					if (!node.children) {
						d3.select(node.data.textNode).style("fill", "#1F3035");
					}
				}
			});
		}
	}

	function findSuperTribeColor(nodeLabel) {
		let superTribe = findSuperTribe(nodeLabel, metadata);
		if (colorScale) {
			return superTribe ? colorScale(superTribe) : "#1F3035"; // Use colorScale if it's defined
		}
		return "#1F3035"; // Fallback color if colorScale is not defined or no superTribe is found
	}
</script>

<div id="legend">
	<h3>Supertribes</h3>
	<div id="legend-container"></div>
</div>

<section id="svg-container">
	<div id="phyloTree" />
</section>

<div id="tooltip" class="tooltip" style="visibility: hidden; position: fixed;">
	<div id="tooltip-image">
		<!-- IMAGE HERE -->
	</div>

	<div id="tooltip-information">
		<h3 id="tooltip-title" class="tooltip-title">{fullSpeciesName}</h3>
		<div id="tooltip-taxonomy">
			<p>
				<span>{familyName}</span> > <span>{subfamilyName}</span> >
				<span>{supertribeName}</span>
				> <span>{tribeName}</span> > <span>{genusName}</span>
				<span>{speciesName}</span>
			</p>
		</div>
		<div id="tooltip-metadata">
			<div id="tooltip-properties">
				<ul>
					<li>Life Form:</li>
					<li>Growth Form:</li>
					<li>Climate:</li>
					<li>Societal Use:</li>
				</ul>
			</div>
			<div id="tooltip-values">
				<ul>
					<li id="lifeform">{lifeformName}</li>
					<li id="growthform">{growthformName}</li>
					<li id="climate">{climateName}</li>
					<li id="societaluse">{societaluseName}</li>
				</ul>
			</div>
		</div>
	</div>
</div>

<style>
	#phyloTree {
		width: 100%;
		height: 500px;
	}

	#svg-container {
		height: 200vh;
		width: 100vw;
		overflow: hidden;
	}

	#tooltip {
		display: flex;
		gap: 1.5em;
		background-color: #0d1c1bcc;
		border-radius: 5px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
		max-width: 30vw; /* Adjust to desired width */
		color: #e1e1e1;
		font-size: 1em;
		padding: 1em;
		z-index: 1000;
	}

	#tooltip-image {
		background: url("/static/img/sampleimage.jpeg");
		background-size: cover;
		background-position: center;
		background-repeat: none;
		border-radius: 2.5px;
	}

	#tooltip h3 {
		font-family: "Bayon", sans-serif;
		font-weight: 100;
		font-size: 1.5em;
		margin: 0.75em 0.75em 0 0;
		line-height: 1em;
	}

	#tooltip-image {
		width: 40%;
	}

	#tooltip-information {
		width: 60%;
	}

	#tooltip-metadata {
		display: flex;
		font-size: 0.75em;
		font-family: "Inter", sans-serif;
		width: 100%;
	}

	#tooltip-taxonomy p {
		line-height: 1.5em;
	}

	#tooltip-taxonomy p > span {
		background-color: #e1e1e1;
		font-family: "Inter", sans-serif;
		color: black;
		padding: 0.25em 0.75em;
		text-align: center;
		font-size: 0.7em;
		border-radius: 20px;
		font-weight: 900;
	}

	#tooltip-properties > ul {
		padding: 0;
		font-weight: 900;
	}
	#tooltip-properties > ul,
	#tooltip-values > ul {
		list-style-type: none;
	}

	#tooltip-values {
		margin-bottom: 1em;
	}

	#tooltip-values > ul {
		font-weight: 100;
	}

	#legend {
		position: absolute;
		left: 2.5vw;
		top: 82%; /* adjust as needed */
		transform: translateY(-50%); /* to center it vertically */
		font-family: "Inter", sans-serif;

		background-color: #0d1c1bc5;
		padding: 1em;
		border-radius: 10px;
		max-width: 170px;
		height: 180px;
	}

	#legend > h3 {
		font-size: 1em;
		color: #e1e1e1;
		margin: 0.5em 1em auto;
	}
</style>
