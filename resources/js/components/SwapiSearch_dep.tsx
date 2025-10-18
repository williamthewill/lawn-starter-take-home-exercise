import React, { useState } from "react";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";

// Tipos
type Film = {
    title: string;
    uid: string;
    url: string;
    openingCrawl?: string;
    characters?: { name: string; uid: string }[];
};

type PersonDetails = {
    birthYear: string;
    gender: string;
    height: string;
    mass: string;
    hairColor: string;
    eyeColor: string;
};

type Person = {
    name: string;
    uid: string;
    url: string;
    details?: PersonDetails;
    films?: Film[];
};

type SwapiPeopleResponse = {
    swapiPeople: Person[];
};

type SwapiPersonResponse = {
    swapiPerson: Person;
};

type SwapiMovieResponse = {
    swapiMovie: Film;
};

// ✅ Queries
const GET_PEOPLE = gql`
  query GetPeople($name: String!) {
    swapiPeople(name: $name) {
      name
      uid
      url
    }
  }
`;

const GET_PERSON_DETAILS = gql`
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

const GET_MOVIE_DETAILS = gql`
  query GetMovieDetails($id: Int!) {
    swapiMovie(id: $id) {
      title
      openingCrawl
      characters {
        name
        uid
      }
    }
  }
`;

export default function SwapiSearch() {
    const [term, setTerm] = useState("");
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [selectedMovie, setSelectedMovie] = useState<Film | null>(null);
    const [view, setView] = useState<"search" | "person" | "movie">("search");

    const [getPeople, { data: peopleData, loading: loadingPeople }] =
        useLazyQuery<SwapiPeopleResponse>(GET_PEOPLE);

    const [getPersonDetails, { data: personData, loading: loadingDetails }] =
        useLazyQuery<SwapiPersonResponse>(GET_PERSON_DETAILS, {
            fetchPolicy: "network-only",
        });

    const [getMovieDetails, { data: movieData, loading: loadingMovie }] =
        useLazyQuery<SwapiMovieResponse>(GET_MOVIE_DETAILS, {
            fetchPolicy: "network-only",
        });

    const handleSearch = () => {
        if (!term.trim()) return;
        getPeople({ variables: { name: term } });
    };

    const peopleResults: Person[] = peopleData?.swapiPeople ?? [];
    const personDetails = personData?.swapiPerson;
    const movieDetails = movieData?.swapiMovie;

    const isButtonDisabled = !term.trim() || loadingPeople;

    const handleSeeDetails = (person: Person) => {
        setSelectedPerson(person);
        setView("person");
        getPersonDetails({ variables: { id: parseInt(person.uid, 10) } });
    };

    const handleBackToSearch = () => {
        setSelectedMovie(null);
        setSelectedPerson(null);
        setView("search");
    };

    const handleMovieClick = (film: Film) => {
        setSelectedMovie(film);
        setView("movie");
        getMovieDetails({ variables: { id: parseInt(film.uid, 10) } });
    };

    const handleCharacterClick = (char: { uid: string; name: string }) => {
        setSelectedPerson({ name: char.name, uid: char.uid, url: "", films: [] });
        setSelectedMovie(null);
        setView("person");
        getPersonDetails({ variables: { id: parseInt(char.uid, 10) } });
    };

    // =========================
    // VIEW: MOVIE DETAILS
    // =========================
    if (view === "movie") {
        const m = movieDetails;

        return (
            <div
                style={{
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    padding: "30px",
                    background: "#fff",
                    maxWidth: "900px",
                    margin: "40px auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                }}
            >
                <h2 style={{ marginBottom: "10px" }}>
                    {m?.title ?? selectedMovie?.title ?? "Movie Details"}
                </h2>

                {loadingMovie && !m ? (
                    <div
                        style={{
                            minHeight: 220,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#999",
                            fontStyle: "italic",
                            fontWeight: 500,
                        }}
                    >
                        Loading movie details…
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "40px",
                        }}
                    >
                        {/* OPENING CRAWL */}
                        <div>
                            <h4
                                style={{
                                    borderBottom: "1px solid #ddd",
                                    paddingBottom: "4px",
                                    marginBottom: "10px",
                                }}
                            >
                                Opening Crawl
                            </h4>
                            <p style={{ whiteSpace: "pre-line" }}>
                                {m?.openingCrawl ?? "—"}
                            </p>
                        </div>

                        {/* CHARACTERS */}
                        <div>
                            <h4
                                style={{
                                    borderBottom: "1px solid #ddd",
                                    paddingBottom: "4px",
                                    marginBottom: "10px",
                                }}
                            >
                                Characters
                            </h4>
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                {m?.characters?.length ? (
                                    m.characters.map((char, i) => (
                                        <li key={char.uid} style={{ display: "inline" }}>
                                            <a
                                                href="#"
                                                style={{
                                                    color: "#007bff",
                                                    textDecoration: "none",
                                                    marginRight: "6px",
                                                }}
                                                onClick={() => handleCharacterClick(char)}
                                                onMouseOver={(e) =>
                                                    (e.currentTarget.style.textDecoration = "underline")
                                                }
                                                onMouseOut={(e) =>
                                                    (e.currentTarget.style.textDecoration = "none")
                                                }
                                            >
                                                {char.name}
                                            </a>
                                            {i < m.characters!.length - 1 && ", "}
                                        </li>
                                    ))
                                ) : (
                                    <li style={{ color: "#888" }}>No characters found.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleBackToSearch}
                    style={{
                        alignSelf: "flex-start",
                        background: "#00b865",
                        color: "white",
                        border: "none",
                        borderRadius: "25px",
                        padding: "10px 20px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginTop: "20px",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#009f58")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "#00b865")}
                >
                    BACK TO SEARCH
                </button>
            </div>
        );
    }

    // =========================
    // VIEW: PERSON DETAILS
    // =========================
    if (view === "person") {
        const d = personDetails?.details;

        return (
            <div
                style={{
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    padding: "30px",
                    background: "#fff",
                    maxWidth: "900px",
                    margin: "40px auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                }}
            >
                <h2 style={{ marginBottom: "10px" }}>
                    {personDetails?.name ?? selectedPerson?.name ?? "Details"}
                </h2>

                {loadingDetails && !personDetails ? (
                    <div
                        style={{
                            minHeight: 220,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#999",
                            fontStyle: "italic",
                            fontWeight: 500,
                        }}
                    >
                        Loading details…
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "40px",
                        }}
                    >
                        {/* DETAILS */}
                        <div>
                            <h4
                                style={{
                                    borderBottom: "1px solid #ddd",
                                    paddingBottom: "4px",
                                    marginBottom: "10px",
                                }}
                            >
                                Details
                            </h4>
                            <p>Birth Year: {d?.birthYear ?? "—"}</p>
                            <p>Gender: {d?.gender ?? "—"}</p>
                            <p>Eye Color: {d?.eyeColor ?? "—"}</p>
                            <p>Hair Color: {d?.hairColor ?? "—"}</p>
                            <p>Height: {d?.height ?? "—"}</p>
                            <p>Mass: {d?.mass ?? "—"}</p>
                        </div>

                        {/* MOVIES */}
                        <div>
                            <h4
                                style={{
                                    borderBottom: "1px solid #ddd",
                                    paddingBottom: "4px",
                                    marginBottom: "10px",
                                }}
                            >
                                Movies
                            </h4>
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                {personDetails?.films?.length ? (
                                    personDetails.films.map((film) => (
                                        <li key={film.uid} style={{ marginBottom: "6px" }}>
                                            <a
                                                href="#"
                                                onClick={() => handleMovieClick(film)}
                                                style={{
                                                    color: "#007bff",
                                                    textDecoration: "none",
                                                }}
                                                onMouseOver={(e) =>
                                                    (e.currentTarget.style.textDecoration = "underline")
                                                }
                                                onMouseOut={(e) =>
                                                    (e.currentTarget.style.textDecoration = "none")
                                                }
                                            >
                                                {film.title}
                                            </a>
                                        </li>
                                    ))
                                ) : (
                                    <li style={{ color: "#888" }}>No movies found.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleBackToSearch}
                    style={{
                        alignSelf: "flex-start",
                        background: "#00b865",
                        color: "white",
                        border: "none",
                        borderRadius: "25px",
                        padding: "10px 20px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginTop: "20px",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#009f58")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "#00b865")}
                >
                    BACK TO SEARCH
                </button>
            </div>
        );
    }

    // =========================
    // VIEW: SEARCH + RESULTS
    // =========================
    return (
        <div style={{ display: "flex", padding: "20px", gap: "20px" }}>
            {/* SEARCH BOX */}
            <div
                style={{
                    width: "350px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    padding: "20px",
                    background: "#fff",
                }}
            >
                <h3>What are you searching for?</h3>

                {/* Radio buttons */}
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ marginRight: "15px" }}>
                        <input
                            type="radio"
                            name="searchType"
                            value="people"
                            checked={true}
                            style={{ marginRight: "5px" }}
                            readOnly
                        />
                        People
                    </label>
                    <label style={{ color: "#aaa" }}>
                        <input
                            type="radio"
                            name="searchType"
                            value="movies"
                            disabled
                            style={{ marginRight: "5px" }}
                        />
                        Movies
                    </label>
                </div>

                {/* Input */}
                <input
                    type="text"
                    placeholder="e.g. Chewbacca, Yoda, Boba Fett"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "10px",
                        marginBottom: "15px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                    }}
                />

                {/* Search button */}
                <button
                    onClick={handleSearch}
                    disabled={isButtonDisabled}
                    style={{
                        width: "100%",
                        padding: "12px",
                        background: isButtonDisabled ? "#ccc" : "#4caf50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isButtonDisabled ? "not-allowed" : "pointer",
                        fontWeight: "bold",
                        transition: "background 0.2s",
                    }}
                >
                    {loadingPeople ? "Searching..." : "SEARCH"}
                </button>
            </div>

            {/* RESULTS */}
            <div
                style={{
                    flex: 1,
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    padding: "20px",
                    background: "#fff",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <h3 style={{ borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>
                    Results
                </h3>

                {loadingPeople ? (
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#999",
                            fontStyle: "italic",
                            fontWeight: 500,
                        }}
                    >
                        Searching...
                    </div>
                ) : peopleResults.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            color: "#999",
                            fontSize: "14px",
                            marginTop: "60px",
                            lineHeight: "1.5",
                        }}
                    >
                        <strong
                            style={{ display: "block", color: "#888", marginBottom: "5px" }}
                        >
                            There are zero matches.
                        </strong>
                        Use the form to search for People.
                    </div>
                ) : (
                    <ul style={{ listStyle: "none", paddingLeft: 0, marginTop: "10px" }}>
                        {peopleResults.map((person) => (
                            <li
                                key={person.uid}
                                style={{
                                    borderBottom: "1px solid #eee",
                                    padding: "12px 0",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <strong style={{ fontSize: "16px", color: "#222" }}>
                                    {person.name}
                                </strong>

                                <button
                                    style={{
                                        background: "#00b865",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "25px",
                                        padding: "8px 18px",
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        transition: "background 0.2s",
                                    }}
                                    onClick={() => handleSeeDetails(person)}
                                    onMouseOver={(e) =>
                                        (e.currentTarget.style.background = "#009f58")
                                    }
                                    onMouseOut={(e) =>
                                        (e.currentTarget.style.background = "#00b865")
                                    }
                                >
                                    SEE DETAILS
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
