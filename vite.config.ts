import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';

const isDocker = process.env.DOCKER_BUILD === 'true';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        ...(isDocker
            ? []
            : [
                wayfinder({
                    formVariants: true,
                }),
            ]),
    ],
    server: {
        host: true, // permite conexões externas
        port: 5173,
        strictPort: true,
        watch: {
            usePolling: true,
        },
        cors: {
            origin: [
                'http://localhost:8000', // Laravel local
                'http://127.0.0.1:8000', // fallback
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            credentials: true,
        },
        hmr: {
            host: 'localhost',
            protocol: 'ws',
            port: 5173,
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
});
