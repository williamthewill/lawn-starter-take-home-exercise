import React, { useEffect, useState } from "react";
import { Film, FilmRef } from "../types";

type MovieDetailsProps = {
    movieDetails?: Film;
    selectedMovie?: Film | FilmRef | null;
    loadingMovie: boolean;
    handleCharacterClick: (char: { uid: string; name: string }) => void;
    handleBackToSearch: () => void;
};

/**
 * MovieDetails component displays detailed information about a selected movie.
 */
export default function MovieDetails({
    movieDetails,
    selectedMovie,
    loadingMovie,
    handleCharacterClick,
    handleBackToSearch,
}: MovieDetailsProps) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 720);
    const m = movieDetails;

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 720);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div
            className="details"
            style={{
                padding: "0 30px",
                maxWidth: "900px",
                transition: "all 0.3s ease",
            }}
        >
            <h2
                className="title"
                style={{
                    color: "rgb(56, 56, 56)",
                    fontWeight: "bold",
                    fontSize: "30px",
                }}
            >{m?.title ?? selectedMovie?.title ?? "Movie Details"}</h2>

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
                    className="movie-details-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "40px",
                    }}
                >
                    {/* Coluna esquerda */}
                    <div>
                        <h4
                            className="subtitle"
                            style={{
                                borderBottom: "1px solid rgb(196, 196, 196)",
                                paddingBottom: "4px",
                                fontWeight: "bold",
                            }}>
                            Opening Crawl
                        </h4>
                        <p style={{ whiteSpace: "pre-line" }}>{m?.openingCrawl ?? "—"}</p>
                    </div>

                    {/* Coluna direita */}
                    <div>
                        <h4
                            className="subtitle"
                            style={{
                                borderBottom: "1px solid rgb(196, 196, 196)",
                                paddingBottom: "4px",
                                fontWeight: "bold",
                            }}>
                            Characters
                        </h4>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {m?.characters?.length ? (
                                m.characters.map((char, i) => (
                                    <li className="navigation" key={char.uid} style={{ display: "inline" }}>
                                        <a
                                            className="link"
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
                    backgroundColor: "rgb(10, 180, 99)",
                    color: "white",
                    border: "none",
                    borderRadius: "25px",
                    padding: "4px 14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    marginTop: "20px",
                    width: isMobile ? "80%" : "184px",
                    height: "34px",
                    fontSize: "15px",
                }}
            >
                BACK TO SEARCH
            </button>

            <style>
                {`
                @media (max-width: 720px) {
                    .movie-details-grid {
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 30px !important;
                    }

                    button {
                        align-self: center !important;
                    }
                }
                `}
            </style>
        </div>
    );
}
