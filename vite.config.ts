import { defineConfig } from 'vite';
import { resolve } from 'path';
import { rmSync } from 'fs';
import autoprefixer from 'autoprefixer';

if (process.env.FLUSH_DIST === 'true') {
	rmSync('dist', { recursive: true, force: true });
}

const entry = resolve(import.meta.dirname, 'src/gutenberg/index.tsx');

export default defineConfig({
	logLevel: (process.env.VITE_LOG_LEVEL as 'info' | 'warn' | 'error' | 'silent') || 'warn',
	define: {
		'process.env': {},
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
	},
	build: {
		lib: {
			entry,
			formats: ['iife'],
			name: 'S2JWebinarSurveyGutenberg',
		},
		rollupOptions: {
			external: (id) => {
				if (id.startsWith('@wordpress/')) return true;
				if (id === 'react' || id === 'react-dom' || id === 'react-dom/client') return true;
				return false;
			},
			input: entry,
			output: {
				globals: (id) => {
					if (id.startsWith('@wordpress/')) {
						const module = id.split('/').pop() ?? '';
						if (id === '@wordpress/data') return 'wp.data';
						if (id === '@wordpress/element') return 'wp.element';
						if (id === '@wordpress/components') return 'wp.components';
						if (id === '@wordpress/i18n') return 'wp.i18n';
						if (id === '@wordpress/plugins') return 'wp.plugins';
						if (id === '@wordpress/edit-post') return 'wp.editPost';
						return `wp.${module}`;
					}
					if (id === 'react') return 'React';
					if (id === 'react-dom' || id === 'react-dom/client') return 'ReactDOM';
					return id;
				},
				assetFileNames: (assetInfo) => {
					if (assetInfo.name?.endsWith('.css')) {
						return 'css/s2j-webinar-survey-gutenberg.css';
					}
					return 'js/[name][extname]';
				},
				entryFileNames: 'js/s2j-webinar-survey-gutenberg.js',
			},
		},
		outDir: 'dist',
		emptyOutDir: false,
		minify: process.env.NODE_ENV === 'production',
		sourcemap: process.env.NODE_ENV !== 'production',
		cssCodeSplit: false,
		reportCompressedSize: false,
	},
	css: {
		postcss: {
			plugins: [
				autoprefixer({
					overrideBrowserslist: ['last 2 versions', '> 1%', 'not dead'],
				}),
			],
		},
	},
	resolve: {
		alias: {
			'@': resolve(import.meta.dirname, 'src'),
		},
	},
});
