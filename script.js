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
    getForecastData(lat, lon);
}

function errorFunction(e) {
    alert('Geolocation, which is required for this page, is not enabled in your browser');
}

// --- Icon Mapping (Updated for amCharts Set) ---
function getLocalIcon(iconCode) {
    const isDay = iconCode.includes('d');
    const code = iconCode.substring(0, 2);
    
    const iconMap = {
        "01": isDay ? "sunny.svg" : "night.svg",
        "02": isDay ? "cloudy-day-1.svg" : "cloudy-night-1.svg",
        "03": isDay ? "cloudy-day-2.svg" : "cloudy-night-2.svg",
        "04": "cloudy.svg",
        "09": "rainy-6.svg", // Heavy showers
        "10": isDay ? "rainy-3.svg" : "rainy-5.svg", // Rain
        "11": "thunder.svg",
        "13": "snowy-6.svg", // Snow
        "50": "cloudy.svg"   // Mist/Fog
    };

    const fileName = iconMap[code] || "cloudy.svg";
    return `icons/${fileName}`;
}

// --- Data Fetching ---
async function getWeatherDataExternal(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        displayData(processData(data));
    } catch (err) {
        throwErrorMsg();
    }
}

async function getForecastData(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        displayHourlyData(data.list);
        displayFiveDayData(data.list);
    } catch (err) {
        console.error("Forecast error:", err);
    }
}

async function getPollutantsData(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        const data = await response.json();
        if (data.list) displayPollutantsData(data.list[0].components);
    } catch (err) {
        console.error("Pollution error:", err);
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

// --- UI Display Functions ---
function displayData(newData) {
    document.querySelector('.current-temperature__value').textContent = `${newData.currentTemp}°`;
    document.querySelector('.current-temperature__summary').textContent = newData.condition;
    document.querySelector('.location-and-date__location').textContent = `${newData.location}, ${newData.country}`;
    document.querySelector('.current-temperature__icon').src = getLocalIcon(newData.iconCode);

    document.querySelector('.current-stats_value_sunrise').textContent = newData.sunrise;
    document.querySelector('.current-stats_value_sunset').textContent = newData.sunset;
    document.querySelector('.current-stats_value_temp_max').textContent = `${newData.tempmax}°`;
    document.querySelector('.current-stats_value_temp_min').textContent = `${newData.tempmin}°`;
    document.querySelector('.current-stats_value_wind').textContent = `${newData.wind} mph`;
    document.querySelector('.current-stats_value_feel').textContent = `${newData.feelsLike}°`;
}

function displayHourlyData(forecastList) {
    const container = document.querySelector('.weather-by-hour__container');
    container.innerHTML = ''; 

    forecastList.slice(0, 7).forEach(hourData => {
        const time = getHrFromTimestamp(hourData.dt);
        const temp = Math.round(hourData.main.temp);
        const iconSrc = getLocalIcon(hourData.weather[0].icon);

        const hourlyHTML = `
            <div class="weather-by-hour__item">
                <div class="weather-by-hour__hour">${time}</div>
                <img src="${iconSrc}" alt="weather icon">
                <div>${temp}&deg;</div>
            </div>`;
        container.insertAdjacentHTML('beforeend', hourlyHTML);
    });
}

function displayFiveDayData(forecastList) {
    const container = document.querySelector('.next-5-days__container');
    container.innerHTML = '';

    const dailyData = forecastList.filter(reading => reading.dt_txt.includes("12:00:00"));

    dailyData.forEach(day => {
        const dateObj = new Date(day.dt * 1000);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
        const iconSrc = getLocalIcon(day.weather[0].icon);

        const rowHTML = `
            <div class="next-5-days__row">
                <div class="next-5-days__date">${dayName}<div class="next-5-days__label">${dateStr}</div></div>
                <div class="next-5-days__low">${Math.round(day.main.temp_min)}&deg;<div class="next-5-days__label">Low</div></div>
                <div class="next-5-days__high">${Math.round(day.main.temp_max)}&deg;<div class="next-5-days__label">High</div></div>
                <div class="next-5-days__icon"><img src="${iconSrc}" alt="weather icon"></div>
                <div class="next-5-days__rain">${Math.round((day.pop || 0) * 100)}%<div class="next-5-days__label">Rain</div></div>
                <div class="next-5-days__wind">${Math.round(day.wind.speed)}mph<div class="next-5-days__label">Wind</div></div>
            </div>`;
        container.insertAdjacentHTML('beforeend', rowHTML);
    });
}

function displayPollutantsData(pollutants) {
    // Optional: Add logic here if you add pollution elements to your index.html
}

// --- Helpers ---
function getHrFromTimestamp(ts) {
    let date = new Date(ts * 1000);
    let hours = date.getHours();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return hours + ampm;
}

function throwErrorMsg() {
    if (error) error.style.display = 'block';
}
