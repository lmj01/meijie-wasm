import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'
import path from 'path'

const rollupOptionsInput = {
    index: path.resolve(__dirname, 'index.html'),    
}
  
export default defineConfig({
    optimizeDeps: {
        exclude: [
            // /worker/g
        ],
    },
    plugins: [
        wasm(),
    ],
    worker: {
        plugins: [
            wasm(),
        ],
    },
    resolve: {
        alias: [
            {
                find: '@',
                replacement: path.resolve('./src'),
            }
        ],
    },
    server: {
        headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        },
        port: 7120,
    },
    build: {
        minify: false,
        rollupOptions: {
            input: rollupOptionsInput,
        },
    }
})