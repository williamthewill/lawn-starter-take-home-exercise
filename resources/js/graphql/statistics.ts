import { gql } from "@apollo/client";

const GET_STATISTICS = gql`
  query GetStatistics {
    statistics {
      topFields {
        root_field
        count
        percentage
        total
        created_at
      }
      AverageDuration {
        root_field
        average_duration
        created_at
      }
      BusiestHourToday {
        count
        hour
        updated_at
        created_at
      }
    }
  }
`;

export default GET_STATISTICS;
