const axios = require('axios')
const moviesAxios = axios.create({ baseURL: 'http://localhost:3001' })
const Redis = require('ioredis')
const redis = new Redis()

class MovieController {
  static async getMovie(req, res, next) {
    try {
      const data = await redis.get('movies')
      if (data) {
        res.status(200).json(JSON.parse(data))
      } else {
        const { data } = await moviesAxios.get('/movies')
        await redis.set('movies', JSON.stringify(data))
        res.status(200).json(data)
      }

    } catch (error) {
      console.log(error);
      // res.send(error)
      res.status(404).json(error)
    }
  }
  static async getOne(req, res, next) {
    try {
      const { id } = req.params
      const data = await redis.get('movies')
      const parsedData = JSON.parse(data)
      if (parsedData || parsedData.length > 0) {
        const selectMovie = parsedMovies.filter((movie) => movie._id === id);
        if (!selectMovie.length) {
          const { data } = await moviesAxios.get("/movies/" + id);
          res.status(400).json({ message: "movie not found" });
        } else {
          console.log("data dari redis");
          res.status(200).json(selectMovie[0]);
        }
        res.status(200).json(JSON.parse(data))
      } else {
        const { data } = await moviesAxios.get('/movies/' + id)
        if (!data) {
          res.status(200).json({ message: "no data" });
        }
        res.status(200).json(data);
      }

    } catch (error) {
      res.status(500).json(error);
    }

  }
  static async create(req, res, next) {
    try {
      const movie = {
        title: req.body.title,
        overview: req.body.overview,
        poster_path: req.body.poster_path,
        popularity: req.body.popularity,
        tags: req.body.tags,
      };
      const { data } = await moviesAxios.post("/movies", movie);
      await redis.del("movies");
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json(err);
    }
  }
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const movie = {
        title: req.body.title,
        overview: req.body.overview,
        poster_path: req.body.poster_path,
        popularity: req.body.popularity,
        tags: req.body.tags,
      };
      const { data } = await moviesAxios.put(`/movies/${id}`, movie);
      redis.del("movies");
      console.log("masuk api")
      if (!data.modifiedCount) {
        res.status(400).json({ message: "movie not found" });
      }
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json(err);
    }
  }
  static async destroy(req, res, next) {
    try {
      const { id } = req.params;
      const { data } = await moviesAxios.delete(`/movies/${id}`);
      redis.del("movies");
      if (!data.deletedCount) {
        res.status(400).json({ message: "movie not found" });
      }
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json(err);
    }
  }

}

module.exports = MovieController