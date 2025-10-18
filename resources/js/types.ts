// ==========================
// SWAPI - Shared Types
// ==========================

// Tipo para filmes dentro de um Person
export type FilmRef = {
    title: string;
    uid: string;
    url: string;
};

// Tipo para personagens dentro de um Film
export type CharacterRef = {
    name: string;
    uid: string;
    url: string;
};

// ==========================
// Person
// ==========================
export type Person = {
    name: string;
    uid: string;
    url: string;
    films: FilmRef[];
    details?: {
        birthYear?: string;
        gender?: string;
        height?: string;
        mass?: string;
        hairColor?: string;
        eyeColor?: string;
    };
};

// ==========================
// Film
// ==========================
export type Film = {
    title: string;
    openingCrawl: string;
    uid: string;
    url: string;
    characters: CharacterRef[];
};

// ==========================
// GraphQL Response Types
// ==========================
export type SwapiPeopleResponse = {
    swapiPeople: Person[];
};

export type SwapiMoviesResponse = {
    swapiMovies: Film[];
};

export type SwapiPersonResponse = {
    swapiPerson: Person;
};

export type SwapiMovieResponse = {
    swapiMovie: Film;
};
