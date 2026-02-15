const error = document.querySelector('.error-msg');
const API_KEY = '3c9dca3280b2d474a1b54e8cf6882d0e';

// --- Initialization ---

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
}

function successFunction(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    getWeatherDataExternal(lat, lon);
    getPollutantsData(lat, lon);
    getForecastData(lat, lon); // Fetches both Hourly and 5-Day data
}

function errorFunction(e) {
    alert('Geolocation, which is required for this page, is not enabled in your browser');
}

// --- Icon Mapping ---
// Maps OpenWeather icon codes to your local folder files
function getLocalIcon(iconCode) {
    const iconMap = {
        "01d": "sunny.svg",
        "01n": "sunny.svg", // Or a night icon if you have one
        "02d": "mostly-sunny.svg",
        "02n": "mostly-sunny.svg",
        "03d": "mostly-sunny.svg", 
        "03n": "mostly-sunny.svg",
        "04d": "mostly-sunny.svg",
        "09d": "rain.svg", // Assumes you have rain.svg
        "10d": "rain.svg",
        "11d": "thunderstorm.svg",
        "13d": "snow.svg",
        "50d": "mostly-sunny.svg"
    };
    return `icons/${iconMap[iconCode] || "mostly-sunny.svg"}`;
}

// --- Data Fetching ---

async function getWeatherDataExternal(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const weatherData = await response.json();
        const newData = processData(weatherData);
        displayData(newData);
    } catch (err) {
        throwErrorMsg();
    }
}

async function getForecastData(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const forecastData = await response.json();
        displayHourlyData(forecastData.list);
        displayFiveDayData(forecastData.list);
    } catch (err) {
        console.error("Forecast error:", err);
    }
}

async function getPollutantsData(lat, lon) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    if (response.ok) {
        const pollutantsData = await response.json();
        const newPollutantsData = processPollutantsData(pollutantsData);
        displayPollutantsData(newPollutantsData);
    }
}

// --- Data Processing ---

function processData(weatherData) {
    return {
        condition: weatherData.weather[0].description,
        iconCode: weatherData.weather[0].icon,
        feelsLike: Math.round(weatherData.main.feels_like),
        currentTemp: Math.round(weatherData.main.temp),
        wind: Math.round(weatherData.wind.speed),
        location: weatherData.name.toUpperCase(),
        country: weatherData.sys.country,
        sunrise: getHrFromTimestamp(weatherData.sys.sunrise),
        sunset: getHrFromTimestamp(weatherData.sys.sunset),
        tempmin: Math.round(weatherData.main.temp_min),
        tempmax: Math.round(weatherData.main.temp_max),
    };
}

function processPollutantsData(pollutantsData) {
    return pollutantsData.list[0].components;
}

// --- UI Display Functions ---

function displayData(newData) {
    document.querySelector('.current-temperature__value').textContent = `${newData.currentTemp}°`;
    document.querySelector('.current-temperature__summary').textContent = newData.condition;
    document.querySelector('.location-and-date__location').textContent = `${newData.location}, ${newData.country}`;
    
    // Set Main Icon
    document.querySelector('.current-temperature__icon').src = getLocalIcon(newData.iconCode);

    // Stats
    document.querySelector('.current-stats_value_sunrise').textContent = newData.sunrise;
    document.querySelector('.current-stats_value_sunset').textContent = newData.sunset;
    document.querySelector('.current-stats_value_temp_max').textContent = `${newData.tempmax}°`;
    document.querySelector('.current-stats_value_temp_min').textContent = `${newData.tempmin}°`;
    document.querySelector('.current-stats_value_wind').textContent = `${newData.wind} mph`;
    document.querySelector('.current-stats_value_feel').textContent = `${newData.feelsLike}°`;
}

function displayHourlyData(forecastList) {
    const container = document.querySelector('.weather-by-hour__container');
    container.innerHTML = ''; // Clear static HTML

    // Display next 7 intervals (approx 21 hours)
    forecastList.slice(0, 7).forEach(hourData => {
        const time = getHrFromTimestamp(hourData.dt);
        const temp = Math.round(hourData.main.temp);
        const iconSrc = getLocalIcon(hourData.weather[0].icon);

        const hourlyHTML = `
            <div class="weather-by-hour__item">
                <div class="weather-by-hour__hour">${time}</div>
                <img src="${iconSrc}" alt="weather">
                <div>${temp}&deg;</div>
            </div>`;
        container.insertAdjacentHTML('beforeend', hourlyHTML);
    });
}

function displayFiveDayData(forecastList) {
    const container = document.querySelector('.next-5-days__container');
    container.innerHTML = '';

    // Filter for 12:00 PM readings to represent each day
    const dailyData = forecastList.filter(reading => reading.dt_txt.includes("12:00:00"));

    dailyData.forEach(day => {
        const dateObj = new Date(day.dt * 1000);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
        
        const high = Math.round(day.main.temp_max);
        const low = Math.round(day.main.temp_min);
        const rain = day.pop ? Math.round(day.pop * 100) : 0;
        const wind = Math.round(day.wind.speed);
        const iconSrc = getLocalIcon(day.weather[0].icon);

        const rowHTML = `
            <div class="next-5-days__row">
                <div class="next-5-days__date">${dayName}<div class="next-5-days__label">${dateStr}</div></div>
                <div class="next-5-days__low">${low}&deg;<div class="next-5-days__label">Low</div></div>
                <div class="next-5-days__high">${high}&deg;<div class="next-5-days__label">High</div></div>
                <div class="next-5-days__icon"><img src="${iconSrc}" alt="icon"></div>
                <div class="next-5-days__rain">${rain}%<div class="next-5-days__label">Rain</div></div>
                <div class="next-5-days__wind">${wind}mph<div class="next-5-days__label">Wind</div></div>
            </div>`;
        container.insertAdjacentHTML('beforeend', rowHTML);
    });
}

function displayPollutantsData(pollutants) {
    // Only updates if the elements exist in your HTML
    const updateEl = (cls, val) => {
        const el = document.querySelector(cls);
        if (el) el.textContent = val;
    };
    updateEl('.co', `CO: ${pollutants.co}`);
    updateEl('.no2', `NO2: ${pollutants.no2}`);
    // Add others as needed
}

// --- Helpers ---

function getHrFromTimestamp(ts) {
    let date = new Date(ts * 1000);
    let hours = date.getHours();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return hours + ampm;
}

function throwErrorMsg() {
    if (error) error.style.display = 'block';
}
