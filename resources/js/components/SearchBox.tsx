import React from "react";

interface SearchBoxProps {
    term: string;
    setTerm: React.Dispatch<React.SetStateAction<string>>;
    searchType: "people" | "movies";
    setSearchType: React.Dispatch<React.SetStateAction<"people" | "movies">>;
    handleSearch: () => void;
    isButtonDisabled: boolean;
    loadingPeople?: boolean;
}

/**
 * SearchBox component allows users to input search terms and select search type.
 */
export default function SearchBox({
    term,
    setTerm,
    searchType,
    setSearchType,
    handleSearch,
    isButtonDisabled,
    loadingPeople,
}: SearchBoxProps) {
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: "8px",
                padding: "20px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
        >
            <h3 style={{ color: "#00b865", marginBottom: "15px" }}>
                What are you searching for?
            </h3>

            {/* RADIO SELECTION */}
            <div style={{ marginBottom: "15px" }}>
                <label style={{ marginRight: "15px" }}>
                    <input
                        type="radio"
                        name="searchType"
                        value="people"
                        checked={searchType === "people"}
                        onChange={() => setSearchType("people")}
                        style={{ marginRight: "5px" }}
                    />
                    People
                </label>
                <label>
                    <input
                        type="radio"
                        name="searchType"
                        value="movies"
                        checked={searchType === "movies"}
                        onChange={() => setSearchType("movies")}
                        style={{ marginRight: "5px" }}
                    />
                    Movies
                </label>
            </div>

            {/* INPUT */}
            <input
                type="text"
                placeholder={
                    searchType === "people"
                        ? "e.g. Chewbacca, Yoda, Boba Fett"
                        : "e.g. A New Hope, The Empire Strikes Back"
                }
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

            {/* BUTTON */}
            <button
                onClick={handleSearch}
                disabled={isButtonDisabled}
                style={{
                    width: "100%",
                    padding: "12px",
                    background: isButtonDisabled ? "#ccc" : "#00b865",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isButtonDisabled ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                }}
            >
                {loadingPeople ? "Searching..." : "SEARCH"}
            </button>
        </div>
    );
}
