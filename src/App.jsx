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
  const defaultCity = "New Delhi"; // Default city for initial load
  const [city, setCity] = useState(""); // Input field is empty
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [unit, setUnit] = useState("metric");
  const [favorites, setFavorites] = useState([]);

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;


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

  // Load default city weather on mount
  useEffect(() => {
    getWeather(defaultCity);
  }, [unit]);

  // Load favorites from localStorage
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

  // Prepare chart data
  const chartData = {
    labels: forecast.map((f) => new Date(f.dt * 1000).toLocaleTimeString([], { hour: "2-digit" })),
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
          <button onClick={() => getWeather(city || defaultCity)}>Search</button>
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
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt="Weather Icon"
            />
            <p className="condition">{weather.weather[0].description}</p>
            <p className="temp">{Math.round(weather.main.temp)}°{unit === "metric" ? "C" : "F"}</p>
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
                  <p>{new Date(f.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  <img src={`https://openweathermap.org/img/wn/${f.weather[0].icon}.png`} alt="forecast" />
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
                    background: darkMode ? "#333" : "#f5f5f5",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                >
                  <button
                    className="toggle-btn unit"
                    onClick={() => getWeather(fav)}
                  >
                    {fav}
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => removeFavorite(fav)}
                  >
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
