import React, { useEffect, useState } from "react";
import { Person, Film } from "../types";

interface ResultsListProps {
    peopleResults?: Person[];
    movieResults?: Film[];
    searchType: "people" | "movies";
    loadingPeople?: boolean;
    loadingMovies?: boolean;
    handleSeeDetails: (item: Person | Film) => void;
    handleBackToSearch: () => void;
}

export default function ResultsList({
    peopleResults = [],
    movieResults = [],
    searchType,
    loadingPeople = false,
    loadingMovies = false,
    handleSeeDetails,
    handleBackToSearch,
}: ResultsListProps) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 720);
    const isLoading = searchType === "people" ? loadingPeople : loadingMovies;
    const results = searchType === "people" ? peopleResults : movieResults;

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 720);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div
            style={{
                background: isMobile ? "transparent" : "#fff",
                borderRadius: isMobile ? "0" : "8px",
                boxShadow: isMobile ? "none" : "0 2px 6px rgba(0,0,0,0.1)",
                padding: "0 20px",
                transition: "all 0.3s ease",
                minHeight: "350px",
                margin: "0 auto",
            }}
        >
            <h3
                style={{
                    margin: "15px",
                    color: "rgb(56, 56, 56)",
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
                    There are zero matches.<br />
                    Use the form to search for People or Movies
                </div>
            )}

            {/* RESULTS */}
            {!isLoading && results.length > 0 && (
                <ul
                    style={{
                        listStyle: "none",
                        paddingLeft: 0,
                        margin: 0,
                        marginBottom: isMobile ? "70px" : "auto"
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
                                borderBottom: "1px solid rgb(196, 196, 196)",
                                padding: "12px 0",
                                gap: "8px",
                            }}
                        >
                            <div style={{ flex: "1 1 auto", minWidth: "200px" }}>
                                {searchType === "people" ? (
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
                                ) : (
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
                                    backgroundColor: "rgb(10, 180, 99)",
                                    color: "#fff",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    transition: "background 0.2s ease",
                                    width: "100%",
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
                                SEE DETAILS
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {!isLoading && isMobile && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "0",
                        backgroundColor: "#fff",
                        width: "100%",
                        paddingRight: "80px",
                        height: "70px",
                    }}
                >
                    <button
                        onClick={handleBackToSearch}
                        style={{
                            alignSelf: "flex-start",
                            backgroundColor: "rgb(10, 180, 99)",
                            color: "white",
                            border: "none",
                            borderRadius: "25px",
                            fontWeight: "700",
                            cursor: "pointer",
                            marginTop: "20px",
                            width: "100%",
                            height: "34px",
                            fontSize: "15px",
                        }}
                    >
                        BACK TO SEARCH
                    </button>

                </div>
            )}
        </div>
    );
}
