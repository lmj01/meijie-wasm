import { defineConfig } from 'vite'
import path from 'path'

const rollupOptionsInput = {
    index: path.resolve(__dirname, 'index.html'),    
    reslice: path.resolve(__dirname, 'reslice.html'),    
}
  
export default defineConfig({
    optimizeDeps: {
        exclude: [
            // /worker/g
        ],
    },
    plugins: [
        // wasm(),
    ],
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
        port: 7130,
    },
    build: {
        minify: false,
        rollupOptions: {
            input: rollupOptionsInput,
        },
    }
})
