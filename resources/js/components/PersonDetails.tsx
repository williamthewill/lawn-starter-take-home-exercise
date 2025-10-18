import React from "react";
import { Film, Person, FilmRef } from "../types";

type PersonDetailsProps = {
    personDetails?: Person;
    selectedPerson?: Person | null;
    loadingDetails: boolean;
    handleMovieClick: (film: Film | FilmRef) => void;
    handleBackToSearch: () => void;
};

export default function PersonDetails({
    personDetails,
    selectedPerson,
    loadingDetails,
    handleMovieClick,
    handleBackToSearch,
}: PersonDetailsProps) {
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
                    <div>
                        <h4 style={{ borderBottom: "1px solid #ddd", paddingBottom: "4px" }}>
                            Details
                        </h4>
                        <p>Birth Year: {d?.birthYear ?? "—"}</p>
                        <p>Gender: {d?.gender ?? "—"}</p>
                        <p>Eye Color: {d?.eyeColor ?? "—"}</p>
                        <p>Hair Color: {d?.hairColor ?? "—"}</p>
                        <p>Height: {d?.height ?? "—"}</p>
                        <p>Mass: {d?.mass ?? "—"}</p>
                    </div>

                    <div>
                        <h4 style={{ borderBottom: "1px solid #ddd", paddingBottom: "4px" }}>
                            Movies
                        </h4>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {personDetails?.films?.length ? (
                                personDetails.films.map((film) => (
                                    <li key={film.uid} style={{ marginBottom: "6px" }}>
                                        <a
                                            href="#"
                                            onClick={() => handleMovieClick(film)}
                                            style={{ color: "#007bff", textDecoration: "none" }}
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
            >
                BACK TO SEARCH
            </button>
        </div>
    );
}
