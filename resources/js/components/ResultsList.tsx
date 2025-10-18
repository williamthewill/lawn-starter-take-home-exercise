import React from "react";
import { Person, Film } from "../types";

interface ResultsListProps {
    peopleResults?: Person[];
    movieResults?: Film[];
    searchType: "people" | "movies";
    loadingPeople?: boolean;
    loadingMovies?: boolean;
    handleSeeDetails: (item: Person | Film) => void;
}

export default function ResultsList({
    peopleResults = [],
    movieResults = [],
    searchType,
    loadingPeople = false,
    loadingMovies = false,
    handleSeeDetails,
}: ResultsListProps) {
    const isLoading = searchType === "people" ? loadingPeople : loadingMovies;

    const results =
        searchType === "people" ? peopleResults : movieResults;

    return (
        <div
            style={{
                background: "#fff",
                borderRadius: "8px",
                padding: "20px",
                minHeight: "350px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
            }}
        >
            <h3
                style={{
                    marginBottom: "15px",
                    color: "#00b865",
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                }}
            >
                Results
            </h3>

            {/* LOADING */}
            {isLoading && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "250px",
                        fontStyle: "italic",
                        color: "#777",
                        fontSize: "1.1rem",
                    }}
                >
                    Searching...
                </div>
            )}

            {/* EMPTY */}
            {!isLoading && results.length === 0 && (
                <div
                    style={{
                        textAlign: "center",
                        color: "#777",
                        opacity: 0.7,
                        padding: "40px 0",
                        fontSize: "1rem",
                    }}
                >
                    No results yet
                </div>
            )}

            {/* RESULTS */}
            {!isLoading && results.length > 0 && (
                <ul
                    style={{
                        listStyle: "none",
                        paddingLeft: 0,
                        margin: 0,
                    }}
                >
                    {results.map((item, index) => (
                        <li
                            key={item.uid || index}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                flexWrap: "wrap",
                                borderBottom: "1px solid #eee",
                                padding: "12px 0",
                                gap: "8px",
                            }}
                        >
                            <div style={{ flex: "1 1 auto", minWidth: "200px" }}>
                                {searchType === "people" ? (
                                    <>
                                        <strong
                                            style={{
                                                display: "block",
                                                fontSize: "1rem",
                                                color: "#333",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {(item as Person).name}
                                        </strong>
                                        <span
                                            style={{
                                                fontSize: "0.9rem",
                                                color: "#666",
                                                lineHeight: 1.4,
                                            }}
                                        >
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <strong
                                            style={{
                                                display: "block",
                                                fontSize: "1rem",
                                                color: "#333",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {(item as Film).title}
                                        </strong>
                                        <span
                                            style={{
                                                fontSize: "0.9rem",
                                                color: "#666",
                                                lineHeight: 1.4,
                                            }}
                                        >
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* BUTTON */}
                            <button
                                onClick={() => handleSeeDetails(item)}
                                style={{
                                    flexShrink: 0,
                                    padding: "8px 18px",
                                    fontSize: "clamp(13px, 1vw, 15px)",
                                    borderRadius: "25px",
                                    border: "none",
                                    backgroundColor: "#00b865",
                                    color: "#fff",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    transition: "background 0.2s ease",
                                }}
                                onMouseOver={(e) =>
                                ((e.target as HTMLButtonElement).style.backgroundColor =
                                    "#009e59")
                                }
                                onMouseOut={(e) =>
                                ((e.target as HTMLButtonElement).style.backgroundColor =
                                    "#00b865")
                                }
                            >
                                DETAILS
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
