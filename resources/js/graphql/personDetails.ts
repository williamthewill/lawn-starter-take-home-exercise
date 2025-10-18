import { gql } from "@apollo/client";

export const GET_PERSON_DETAILS = gql`
  query GetPersonDetails($id: Int!) {
    swapiPerson(id: $id) {
      name
      details {
        birthYear
        gender
        height
        mass
        hairColor
        eyeColor
      }
      films {
        title
        uid
        url
      }
    }
  }
`;
