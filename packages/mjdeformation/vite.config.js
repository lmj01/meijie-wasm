import { defineConfig } from 'vite'
import path from 'path'

const rollupOptionsInput = {
    target: path.resolve(__dirname, 'index.html'),    
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
    server: {
        headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        },
        port: 7110,
    },
    build: {
        minify: false,
        rollupOptions: {
            input: rollupOptionsInput,
        },
    }
})