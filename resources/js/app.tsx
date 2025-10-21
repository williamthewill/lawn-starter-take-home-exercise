import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client/react';
import client from './apollo';

const appName = import.meta.env.VITE_APP_NAME || 'LawnStarter';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ApolloProvider client={client}>
                <App {...props} />
            </ApolloProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

