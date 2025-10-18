import { gql } from "@apollo/client";

export const GET_PEOPLE = gql`
  query GetPeople($name: String!) {
    swapiPeople(name: $name) {
      name
      uid
      url
    }
  }
`;
