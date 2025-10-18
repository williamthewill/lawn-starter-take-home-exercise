import { gql } from "@apollo/client";

export const GET_MOVIE_DETAILS = gql`
  query GetMovieDetails($id: Int!) {
    swapiMovie(id: $id) {
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