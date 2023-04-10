const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
app.get("/movies/", async (request, response) => {
  const getMovies = `
    SELECT 
    * 
    FROM
        movie;
    `;
  const moviesArray = await database.all(getMovies);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const movieDetails = `
    INSERT INTO 
        movie(director_id,movie_name,lead_actor)
    VALUES
    (${directorId},'${movieName}','${leadActor}');
    `;
  const movieNames = await database.run(movieDetails);
  response.send(movieNames);
});

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getOneMovie = `
    SELECT 
    *
    FROM
    movie
    WHERE 
    movie_id = ${movieId};`;
  const oneMovie = await database.get(getOneMovie);
  response.send(convertDbObjectToResponseObject(oneMovie));
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovies = `
    UPDATE 
    movie
    SET
    director_id = ${directorId}
    movie_name = "${movieName}"
    lead_actor = "${leadActor}"
    WHERE 
    movie_id = ${movieId};
    `;
  await database.run(updateMovies);
  response.send("Movie Details Updated");
});
app.delete("/movies/:movieId", async (request, response) => {
  const deleteMovie = `
    DELETE FROM
    movie
    WHERE 
    movie_id = ${movieId};`;
  await database.run(deleteMovie);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsArray = `
    SELECT 
    *
    FROM
    director;`;
  directorsDetails = await database.get(getDirectorsArray);
  response.send(convertDbObjectToResponseObject(directorsDetails));
});

module.exports = app;
