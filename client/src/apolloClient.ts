import { ApolloClient, InMemoryCache } from '@apollo/client';

export const client = new ApolloClient({
  uri: import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql',
  cache: new InMemoryCache(),
});
