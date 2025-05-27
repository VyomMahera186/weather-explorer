const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const weatherInfo = document.getElementById('weatherInfo');
const loader = document.getElementById('loader');

const UNSPLASH_ACCESS_KEY = '5THZ4QpJ8JOXR3PdfT2hWpAVyo5m80LGa83uvVaO50o'; // ← put your Unsplash key here

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  const welcomeText = document.getElementById("welcomeText");


  if (!city) {
    weatherInfo.innerHTML = `<p>⚠️ Please enter a city name.</p>`;
    return;
  }
if (welcomeText) {
    welcomeText.classList.add('hidden');
  }
  showLoader(true);
  getWeather(city);
  getCityImage(city);
});

function showLoader(isLoading) {
  loader.style.display = isLoading ? 'block' : 'none';
}

async function getWeather(city) {
  try {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      weatherInfo.innerHTML = `<p>❌ No city found. Please enter a valid city name.</p>`;
      document.body.style.backgroundImage = '';
      showLoader(false);
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
    );
    const weatherData = await weatherRes.json();

    const currentTemp = weatherData.current.temperature_2m;
    const currentCode = weatherData.current.weathercode;
    const { emoji, description, icon } = getWeatherDescription(currentCode);

    const tempDisplay = formatTemp(currentTemp);

    const forecast = weatherData.daily;
    let forecastHTML = '<h3>3-Day Forecast</h3><div class="forecast">';

    for (let i = 1; i <= 3; i++) {
      const date = forecast.time[i];
      const min = formatTemp(forecast.temperature_2m_min[i]);
      const max = formatTemp(forecast.temperature_2m_max[i]);
      const code = forecast.weathercode[i];
      const { emoji: fEmoji, description: fDesc } = getWeatherDescription(code);

      forecastHTML += `
        <div class="forecast-day">
          <p><strong>${new Date(date).toDateString().slice(0, 10)}</strong></p>
          <p>${fEmoji} ${fDesc}</p>
          <p>Min: ${min} | Max: ${max}</p>
        </div>
      `;
    }
    forecastHTML += '</div>';

    weatherInfo.innerHTML = `
      <h2>${name}, ${country}</h2>
      <p><strong>${tempDisplay}</strong> — ${emoji} ${description} <img src="${icon}" width="30"/></p>
      ${forecastHTML}
    `;

  } catch (err) {
    weatherInfo.innerHTML = '⚠️ Error fetching weather.';
    console.error(err);
  } finally {
    showLoader(false);
  }
}

async function getCityImage(city) {
  try {
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${city}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`);
    const data = await res.json();
    const imageUrl = data.results[0]?.urls?.regular;
    document.body.style.backgroundImage = imageUrl ? `url(${imageUrl})` : '';
  } catch (err) {
    console.error('Image fetch error', err);
  }
}

function getWeatherDescription(code) {
  const map = {
    0: { description: "Clear sky", emoji: "☀️", icon: "https://openweathermap.org/img/wn/01d.png" },
    1: { description: "Mainly clear", emoji: "🌤️", icon: "https://openweathermap.org/img/wn/02d.png" },
    2: { description: "Partly cloudy", emoji: "⛅", icon: "https://openweathermap.org/img/wn/03d.png" },
    3: { description: "Overcast", emoji: "☁️", icon: "https://openweathermap.org/img/wn/04d.png" },
    45: { description: "Fog", emoji: "🌫️", icon: "https://openweathermap.org/img/wn/50d.png" },
    48: { description: "Rime fog", emoji: "🌫️❄️", icon: "https://openweathermap.org/img/wn/50d.png" },
    51: { description: "Light drizzle", emoji: "🌦️", icon: "https://openweathermap.org/img/wn/09d.png" },
    53: { description: "Moderate drizzle", emoji: "🌧️", icon: "https://openweathermap.org/img/wn/09d.png" },
    55: { description: "Dense drizzle", emoji: "🌧️", icon: "https://openweathermap.org/img/wn/09d.png" },
    61: { description: "Light rain", emoji: "🌧️", icon: "https://openweathermap.org/img/wn/10d.png" },
    63: { description: "Moderate rain", emoji: "🌧️", icon: "https://openweathermap.org/img/wn/10d.png" },
    65: { description: "Heavy rain", emoji: "🌧️💦", icon: "https://openweathermap.org/img/wn/10d.png" },
    71: { description: "Light snow", emoji: "🌨️", icon: "https://openweathermap.org/img/wn/13d.png" },
    73: { description: "Moderate snow", emoji: "❄️", icon: "https://openweathermap.org/img/wn/13d.png" },
    75: { description: "Heavy snow", emoji: "❄️❄️", icon: "https://openweathermap.org/img/wn/13d.png" },
    95: { description: "Thunderstorm", emoji: "⛈️⚡", icon: "https://openweathermap.org/img/wn/11d.png" },
  };
  return map[code] || { description: "Unknown", emoji: "❓", icon: "" };
}

function formatTemp(tempC) {
  const tempF = (tempC * 9 / 5 + 32).toFixed(1);
  return `${tempC.toFixed(1)}°C / ${tempF}°F`;
}

cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchBtn.click();
  }
});

function updateDateTime() {
  const datetimeElement = document.getElementById("datetime");
  const now = new Date();
  datetimeElement.textContent = now.toLocaleString();
}
setInterval(updateDateTime, 1000);
updateDateTime();

cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchBtn.click(); // Triggers the same logic as the click above
  }
});
cityInput.addEventListener('input', () => {
  const welcomeText = document.getElementById("welcomeText");
  if (welcomeText && cityInput.value.trim() === '') {
    welcomeText.classList.remove('hidden');
    weatherInfo.innerHTML = ''; // optional reset
  }
});
