import adapter from "@sveltejs/adapter-auto";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			$stores: 'src/lib/stores',
			$metadata: 'static/metadata',
			$csv: 'static/csv'
		}
	},
};

export default config;
