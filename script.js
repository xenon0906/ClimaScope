const API_KEY = "d56be14c388805394fd337e1ffb77031";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const locationBtn = document.getElementById("locationBtn");
const weatherCard = document.getElementById("weatherCard");

const locationEl = document.getElementById("location");
const iconEl = document.getElementById("icon");
const descEl = document.getElementById("desc");
const tempEl = document.getElementById("temp");
const detailsEl = document.getElementById("details");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getCoordinates(city);
  }
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Reverse Geocode
      const revGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
      const revGeoRes = await fetch(revGeoUrl);
      const revGeoData = await revGeoRes.json();

      if (revGeoData && revGeoData.length > 0) {
        const { name, country, state } = revGeoData[0];
        getWeather(lat, lon, name, country, state);
      } else {
        getWeather(lat, lon, "Current Location", "", "");
      }
    }, () => {
      showError("Location access denied.");
    });
  } else {
    showError("Geolocation not supported.");
  }
});

async function getCoordinates(city) {
  try {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData || geoData.length === 0) {
      showError("City not found.");
      return;
    }

    const { lat, lon, name, country, state } = geoData[0];
    getWeather(lat, lon, name, country, state);
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    showError("Something went wrong. Try again.");
  }
}

async function getWeather(lat, lon, city, country, state) {
  try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const weatherResponse = await fetch(weatherUrl);
    const data = await weatherResponse.json();

    if (data.cod !== 200) {
      showError("Weather data not available.");
      return;
    }

    displayWeather(data, city, country, state);
  } catch (error) {
    console.error("Error fetching weather:", error);
    showError("Failed to get weather.");
  }
}

function displayWeather(data, city, country, state) {
  const iconCode = data.weather[0].icon;
  const description = data.weather[0].description;
  const temperature = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const humidity = data.main.humidity;
  const wind = data.wind.speed;
  const pressure = data.main.pressure;
  const visibility = (data.visibility / 1000).toFixed(1);
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();

  locationEl.textContent = `${city}, ${state || ""} ${country}`;
  iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  descEl.textContent = `🌤 ${capitalize(description)}`;
  tempEl.innerHTML = `
    🌡 Temp: ${temperature}°C<br>
    🤒 Feels Like: ${feelsLike}°C<br>
    💧 Humidity: ${humidity}%<br>
    💨 Wind: ${wind} m/s<br>
    🔽 Pressure: ${pressure} hPa<br>
    👁 Visibility: ${visibility} km<br>
    🌅 Sunrise: ${sunrise}<br>
    🌇 Sunset: ${sunset}
  `;
  detailsEl.textContent = "";
  weatherCard.classList.remove("hidden");
}

function showError(message) {
  locationEl.textContent = message;
  iconEl.src = "";
  descEl.textContent = "";
  tempEl.textContent = "";
  detailsEl.textContent = "";
  weatherCard.classList.remove("hidden");
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
