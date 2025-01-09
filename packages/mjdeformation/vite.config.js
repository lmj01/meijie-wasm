import { defineConfig } from 'vite'
import path from 'path'
import emscriptenStaticWorkerOptions from './vite-fixup-plugin.js'

const rollupOptionsInput = {
    index: path.resolve(__dirname, 'index.html'),    
    bvh: path.resolve(__dirname, 'bvh.html'),    
    triangle: path.resolve(__dirname, 'triangle.html'),    
}
  
export default defineConfig({
    optimizeDeps: {
        // exclude: [/worker/g],
    },
    plugins: [],
    resolve: {
        alias: [
            {
                find: '@',
                replacement: path.resolve('./src'),
            }
        ],
    },
    test: {testTimeout: 15000},
    worker: {format: 'es', plugins: [emscriptenStaticWorkerOptions]},
    server: {
        headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        },
        port: 7110,
    },
    build: {
        target: 'esnext',
        minify: false,
        rollupOptions: {
            input: rollupOptionsInput,
            output: {
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`
            }
        },
    }
})