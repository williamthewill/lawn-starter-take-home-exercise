import React, { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { GET_PEOPLE } from "../graphql/people";
import { GET_MOVIES } from "../graphql/movies";
import { GET_PERSON_DETAILS } from "../graphql/personDetails";
import { GET_MOVIE_DETAILS } from "../graphql/movieDetails";
import SearchBox from "../components/SearchBox";
import ResultsList from "../components/ResultsList";
import PersonDetails from "../components/PersonDetails";
import MovieDetails from "../components/MovieDetails";
import { Person, Film, FilmRef } from "../types";
import Header from "../components/Header";

export default function SwapiSearch() {
    const [term, setTerm] = useState("");
    const [searchType, setSearchType] = useState<"people" | "movies">("people");
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [selectedMovie, setSelectedMovie] = useState<Film | FilmRef | null>(null);
    const [view, setView] = useState<"search" | "results" | "person" | "movie">("search");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 720);

    // GraphQL Queries
    const [getPeople, { data: peopleData, loading: loadingPeople }] =
        useLazyQuery<{ swapiPeople: Person[] }>(GET_PEOPLE);

    const [getMovies, { data: moviesData, loading: loadingMovies }] =
        useLazyQuery<{ swapiMovies: Film[] }>(GET_MOVIES);

    const [getPersonDetails, { data: personData, loading: loadingDetails }] =
        useLazyQuery<{ swapiPerson: Person }>(GET_PERSON_DETAILS, {
            fetchPolicy: "network-only",
        });

    const [getMovieDetails, { data: movieData, loading: loadingMovie }] =
        useLazyQuery<{ swapiMovie: Film }>(GET_MOVIE_DETAILS, {
            fetchPolicy: "network-only",
        });

    // Data
    const peopleResults: Person[] = peopleData?.swapiPeople ?? [];
    const movieResults: Film[] = moviesData?.swapiMovies ?? [];
    const personDetails = personData?.swapiPerson;
    const movieDetails = movieData?.swapiMovie;
    const isButtonDisabled =
        !term.trim() ||
        (searchType === "people" ? loadingPeople : loadingMovies);

    // Handlers
    const handleSearch = () => {
        if (!term.trim()) return;

        if (isMobile) setView("results");

        if (searchType === "people") {
            getPeople({ variables: { name: term } });
        } else {
            getMovies({ variables: { title: term } });
        }
    };

    const handleSeeDetails = (item: Person | Film) => {
        if (searchType === "people") {
            const person = item as Person;
            setSelectedPerson(person);
            setView("person");
            getPersonDetails({ variables: { id: parseInt(person.uid, 10) } });
        } else {
            const movie = item as Film;
            setSelectedMovie(movie);
            setView("movie");
            getMovieDetails({ variables: { id: parseInt(movie.uid, 10) } });
        }
    };

    const handleMovieClick = (film: Film | FilmRef) => {
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

    // 🔙 Sempre volta à tela inicial de busca
    const handleBackToSearch = () => {
        setView("search");
        setSelectedPerson(null);
        setSelectedMovie(null);
        setTerm("");
    };

    const handleBack = () => {
        if (view === "movie") setView("person");
        else if (view === "person") setView("results");
        else if (view === "results") setView("search");
    };

    // Responsividade
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 720);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ===============================
    // MOBILE MODE
    // ===============================
    if (isMobile) {
        return (
            <div
                style={{
                    background: "#fff",
                    minHeight: "100vh",
                    transition: "all 0.3s ease",
                    paddingTop: "65px",
                }}
            >
                <Header onBack={handleBack} isMobile={isMobile} />

                <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                    {view === "search" && (
                        <SearchBox
                            term={term}
                            setTerm={setTerm}
                            searchType={searchType}
                            setSearchType={setSearchType}
                            handleSearch={handleSearch}
                            isButtonDisabled={isButtonDisabled}
                            loadingPeople={loadingPeople || loadingMovies}
                        />
                    )}

                    {view === "results" && (
                        <ResultsList
                            peopleResults={peopleResults}
                            movieResults={movieResults}
                            searchType={searchType}
                            loadingPeople={loadingPeople}
                            loadingMovies={loadingMovies}
                            handleSeeDetails={handleSeeDetails}
                        />
                    )}

                    {view === "person" && (
                        <PersonDetails
                            personDetails={personDetails}
                            selectedPerson={selectedPerson}
                            loadingDetails={loadingDetails}
                            handleMovieClick={handleMovieClick}
                            handleBackToSearch={handleBackToSearch}
                        />
                    )}

                    {view === "movie" && (
                        <MovieDetails
                            movieDetails={movieDetails}
                            selectedMovie={selectedMovie}
                            loadingMovie={loadingMovie}
                            handleCharacterClick={handleCharacterClick}
                            handleBackToSearch={handleBackToSearch}
                        />
                    )}
                </div>
            </div>
        );
    }

    // ===============================
    // DESKTOP MODE
    // ===============================
    return (
        <div style={{ background: "#f5f5f5", minHeight: "100vh", paddingTop: "75px" }}>
            <Header isMobile={isMobile} />

            {view === "search" || view === "results" ? (
                <div
                    style={{
                        display: "flex",
                        padding: "20px",
                        gap: "20px",
                        flexWrap: "wrap",
                        justifyContent: "center",
                    }}
                >
                    {/* Lado esquerdo - Busca */}
                    <div style={{ width: "350px" }}>
                        <SearchBox
                            term={term}
                            setTerm={setTerm}
                            searchType={searchType}
                            setSearchType={setSearchType}
                            handleSearch={handleSearch}
                            isButtonDisabled={isButtonDisabled}
                            loadingPeople={loadingPeople || loadingMovies}
                        />
                    </div>

                    {/* Lado direito - Resultados */}
                    <div
                        style={{
                            flex: "1 1 600px",
                            minWidth: "450px",
                            maxWidth: "700px",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <div style={{ width: "100%", maxWidth: "600px" }}>
                            <ResultsList
                                peopleResults={peopleResults}
                                movieResults={movieResults}
                                searchType={searchType}
                                loadingPeople={loadingPeople}
                                loadingMovies={loadingMovies}
                                handleSeeDetails={handleSeeDetails}
                            />
                        </div>
                    </div>
                </div>
            ) : view === "person" ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "840px",
                            background: "#fff",
                            borderRadius: "8px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                            padding: "30px",
                        }}
                    >
                        <PersonDetails
                            personDetails={personDetails}
                            selectedPerson={selectedPerson}
                            loadingDetails={loadingDetails}
                            handleMovieClick={handleMovieClick}
                            handleBackToSearch={handleBackToSearch}
                        />
                    </div>
                </div>
            ) : (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "840px",
                            background: "#fff",
                            borderRadius: "8px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                            padding: "30px",
                        }}
                    >
                        <MovieDetails
                            movieDetails={movieDetails}
                            selectedMovie={selectedMovie}
                            loadingMovie={loadingMovie}
                            handleCharacterClick={handleCharacterClick}
                            handleBackToSearch={handleBackToSearch}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
