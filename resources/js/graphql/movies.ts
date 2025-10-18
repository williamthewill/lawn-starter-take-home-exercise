import { gql } from "@apollo/client";

export const GET_MOVIES = gql`
  query GetMovies($title: String!) {
    swapiMovies(title: $title) {
      title
      openingCrawl
      uid
      url
      characters {
        name
        uid
        url
      }
    }
  }
`;
