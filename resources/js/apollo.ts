import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
    link: new HttpLink({
        uri: 'http://localhost:8000/graphql',
        fetchOptions: {
            credentials: 'include', // ✅ aqui é o lugar certo
        },
    }),
    cache: new InMemoryCache(),
});

export default client;
