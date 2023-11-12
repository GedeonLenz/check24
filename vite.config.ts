import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		fs: {
			allow: ['public/uploads','static'],
		},
	},
	plugins: [sveltekit()]
});
