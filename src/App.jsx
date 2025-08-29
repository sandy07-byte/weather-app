import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function App() {
  const defaultCity = "New Delhi";
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [unit, setUnit] = useState("metric");
  const [favorites, setFavorites] = useState([]);

  
  const API_KEY = "d7165faf65653253af69abbaae721431";

  const getWeather = async (cityName) => {
    if (!cityName) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=${unit}`
      );
      setWeather(response.data);

      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=${unit}`
      );
      setForecast(forecastRes.data.list.slice(0, 7));

      setError("");
    } catch (err) {
      setError("City not found. Try again!");
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWeather(defaultCity);
  }, [unit]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(saved);
  }, []);

  const addFavorite = () => {
    if (!favorites.includes(city) && city) {
      const updated = [...favorites, city];
      setFavorites(updated);
      localStorage.setItem("favorites", JSON.stringify(updated));
    }
  };

  const removeFavorite = (favCity) => {
    const updated = favorites.filter((c) => c !== favCity);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const getWeatherImage = (condition) => {
    if (!condition) return "/weather-icons/sunny.png"; // default
    condition = condition.toLowerCase();
    if (condition.includes("rain")) return "/weather-icons/rain.png";
    if (condition.includes("cloud")) return "/weather-icons/cloudy.png";
    if (condition.includes("sun") || condition.includes("clear")) return "/weather-icons/sunny.png";
    return "/weather-icons/sunny.png";
  };

  const chartData = {
    labels: forecast.map((f) =>
      new Date(f.dt * 1000).toLocaleTimeString([], { hour: "2-digit" })
    ),
    datasets: [
      {
        label: `Temperature (${unit === "metric" ? "°C" : "°F"})`,
        data: forecast.map((f) => f.main.temp),
        borderColor: "#ff9900",
        backgroundColor: "rgba(255,153,0,0.2)",
      },
    ],
  };

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <h1>🌦 Weather App</h1>

      <div className="weather-card">
        {/* Search + toggles */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Enter city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button className="search-btn" onClick={() => getWeather(city || defaultCity)}>
            🔍
          </button>
          <div className="toggles">
            <button className="toggle-btn dark" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "🌞" : "🌙"}
            </button>
            <button
              className="toggle-btn unit"
              onClick={() => setUnit(unit === "metric" ? "imperial" : "metric")}
            >
              {unit === "metric" ? "°C" : "°F"}
            </button>
          </div>
        </div>

        <button onClick={addFavorite} className="add-favorite-btn">
          Add to Favorites
        </button>

        {error && <p className="error">{error}</p>}
        {loading && <p>Loading...</p>}

        {/* Current weather */}
        {weather && (
          <div className="current-weather">
            <h2>{weather.name}</h2>
            <img
              src={getWeatherImage(weather.weather[0].main)}
              alt={weather.weather[0].description}
            />
            <p className="condition">{weather.weather[0].description}</p>
            <p className="temp">
              {Math.round(weather.main.temp)}°{unit === "metric" ? "C" : "F"}
            </p>
            <p className="feels">Feels like {Math.round(weather.main.feels_like)}°</p>
            <p className="humidity">💧 Humidity: {weather.main.humidity}%</p>
          </div>
        )}

        {/* 2-hour prediction */}
        {forecast.length > 0 && (
          <div className="prediction">
            {forecast[0].weather[0].main.toLowerCase() === "rain"
              ? "🌧 High chance of rain in the next 2 hours."
              : forecast[0].weather[0].main.toLowerCase() === "clouds"
              ? "☁️ It may be cloudy in the next 2 hours."
              : "☀️ The weather looks clear for the next 2 hours."}
          </div>
        )}

        {/* Forecast cards */}
        {forecast.length > 0 && (
          <>
            <div className="forecast">
              {forecast.map((f, i) => (
                <div key={i} className="forecast-card">
                  <p>
                    {new Date(f.dt * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <img src={getWeatherImage(f.weather[0].main)} alt="forecast" />
                  <p>{Math.round(f.main.temp)}°</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "20px" }}>
              <Line data={chartData} />
            </div>
          </>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div style={{ marginTop: "15px" }}>
            <h3>⭐ Favorites</h3>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {favorites.map((fav, idx) => (
                <div
                  key={idx}
                  className="favorite-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#f5f5f5",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                >
                  <button className="toggle-btn unit" onClick={() => getWeather(fav)}>
                    {fav}
                  </button>
                  <button className="remove-btn" onClick={() => removeFavorite(fav)}>
                    ❌
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
