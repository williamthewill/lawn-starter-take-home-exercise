import React from "react";
import { Film, FilmRef } from "../types";

type MovieDetailsProps = {
    movieDetails?: Film;
    selectedMovie?: Film | FilmRef | null;
    loadingMovie: boolean;
    handleCharacterClick: (char: { uid: string; name: string }) => void;
    handleBackToSearch: () => void;
};

export default function MovieDetails({
    movieDetails,
    selectedMovie,
    loadingMovie,
    handleCharacterClick,
    handleBackToSearch,
}: MovieDetailsProps) {
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
            <h2>{m?.title ?? selectedMovie?.title ?? "Movie Details"}</h2>

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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
                    <div>
                        <h4 style={{ borderBottom: "1px solid #ddd", paddingBottom: "4px" }}>
                            Opening Crawl
                        </h4>
                        <p style={{ whiteSpace: "pre-line" }}>{m?.openingCrawl ?? "—"}</p>
                    </div>

                    <div>
                        <h4 style={{ borderBottom: "1px solid #ddd", paddingBottom: "4px" }}>
                            Characters
                        </h4>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {m?.characters?.length ? (
                                m.characters.map((char, i) => (
                                    <li key={char.uid} style={{ display: "inline" }}>
                                        <a
                                            href="#"
                                            onClick={() => handleCharacterClick(char)}
                                            style={{
                                                color: "#007bff",
                                                textDecoration: "none",
                                                marginRight: "6px",
                                            }}
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
            >
                BACK TO SEARCH
            </button>
        </div>
    );
}
