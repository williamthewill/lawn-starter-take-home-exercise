import React, { useEffect, useState } from "react";
import { Film, Person, FilmRef } from "../types";

type PersonDetailsProps = {
    personDetails?: Person;
    selectedPerson?: Person | null;
    loadingDetails: boolean;
    handleMovieClick: (film: Film | FilmRef) => void;
    handleBackToSearch: () => void;
};

/**
 * PersonDetails component displays detailed information about a selected person.
 */
export default function PersonDetails({
    personDetails,
    selectedPerson,
    loadingDetails,
    handleMovieClick,
    handleBackToSearch,
}: PersonDetailsProps) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 720);
    const d = personDetails?.details;

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 720);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div
            className="details"
            style={{
                minHeight: "350px",
                width: "80%",
                margin: "0 auto",
            }}
        >
            <h2
                className="title"
                style={{
                    marginBottom: "10px",
                    color: "rgb(56, 56, 56)",
                    fontWeight: "bold",
                    fontSize: "30px",
                }}>
                {personDetails?.name ?? selectedPerson?.name ?? "Details"}
            </h2>

            {
                loadingDetails && !personDetails ? (
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
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "40px",
                            flexWrap: "nowrap",
                        }}
                        className="details-container"
                    >
                        {/* Coluna de detalhes */}
                        <div
                            style={{
                                flex: "1 1 50%",
                                minWidth: "300px",
                            }}
                        >
                            <h4
                                className="subtitle"
                                style={{
                                    borderBottom: "1px solid rgb(196, 196, 196)",
                                    paddingBottom: "4px",
                                    marginBottom: "10px",
                                    fontWeight: "bold"
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

                        {/* Coluna de filmes */}
                        <div
                            style={{
                                flex: "1 1 50%",
                                minWidth: "300px",
                            }}
                        >
                            <h4
                                className="subtitle"
                                style={{
                                    borderBottom: "1px solid rgb(196, 196, 196)",
                                    paddingBottom: "4px",
                                    marginBottom: "10px",
                                    fontWeight: "bold"
                                }}
                            >
                                Movies
                            </h4>
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                {personDetails?.films?.length ? (
                                    personDetails.films.map((film) => (
                                        <li className="navigation" key={film.uid} style={{ marginBottom: "6px" }}>
                                            <a
                                                className="link"
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
                )
            }

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
                /* Mobile layout */
                @media (max-width: 720px) {
                    .details-container {
                        flex-direction: column !important;
                        gap: 30px !important;
                    }

                    .details-container > div {
                        width: 100% !important;
                        min-width: unset !important;
                    }

                    button {
                        align-self: center !important;
                    }
                }
                `}
            </style>
        </div >
    );
}
