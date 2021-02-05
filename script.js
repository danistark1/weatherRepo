const error = document.querySelector('.error-msg');

function successFunction(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    getWeatherDataExternal(lat, lon);
    getPollutantsData(lat, lon);
    //getWeatherAlerts(lat, lon); TODO
}

function errorFunction(e){
    alert('Geolocation, which is required for this page, is not enabled in your browser');
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
}

function getDateFromTimestamp(ts) {
    let unix_timestamp = ts
// Create a new JavaScript Date object based on the timestamp
// multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(unix_timestamp * 1000);
return date;
}

function getHrFromTimestamp(ts) {
  let unix_timestamp = ts
// Create a new JavaScript Date object based on the timestamp
// multiplied by 1000 so that the argument is in milliseconds, not seconds.
  var date = new Date(unix_timestamp * 1000);
// // Hours part from the timestamp
     var hours = date.getHours();
// // Minutes part from the timestamp
     var minutes = date.getMinutes();
// // Seconds part from the timestamp
//     var seconds = "0" + date.getSeconds();

// Will display time in 10:30:23 format

  return hours+':'+minutes;
}
async function getWeatherDataExternal(lat,lon) {
    const response = await fetch(
        `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=3c9dca3280b2d474a1b54e8cf6882d0e&units=metric`,
        {
            mode: 'cors',
        }
    );
    if (response.status === 400) {
        throwErrorMsg();
    } else {
        // error.style.display = 'none';
        const weatherData = await response.json();
        const newData = processData(weatherData);
        displayData(newData);
    }
}
//https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}

async function getWeatherAlerts(lat,lon) {
    const response = await fetch(
        `http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=3c9dca3280b2d474a1b54e8cf6882d0e&units=metric`,
        {
            mode: 'cors',
        }
    );
    if (response.status === 400) {
        throwErrorMsg();
    } else {
        error.style.display = 'none';
        const weatherAlertsData = await response.json();
        const newAlertsData = processAlertsData(weatherAlertsData);
        displayAlertsData(newAlertsData);
    }
}

async function getPollutantsData(lat, lon) {
    const response = await fetch(
        `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=3c9dca3280b2d474a1b54e8cf6882d0e`,
        {
            mode: 'cors',
        }
    );
    if (response.status === 400) {
        throwErrorMsg();
    } else {
        // error.style.display = 'none';
        const pollutantsData = await response.json();
        const newPollutantsData = processPollutantsData(pollutantsData);
        displayPollutantsData(newPollutantsData);
    }
}

//TOOD
//http://192.168.4.10:8200/weatherstationapi/
async function getWeatherDataInternal() {
    const response = await fetch(
        `http://....../weatherstationapi/outside`,
        {
            mode: 'cors',
        }
    );
    if (response.status === 400) {
        throwErrorMsg();
    } else {
        error.style.display = 'none';
        const weatherData = await response.json();
        console.log(weatherData.name);
        const newData = processData(weatherData);
        //displayData(newData);
        // reset();
    }
}

function throwErrorMsg() {
    error.style.display = 'block';
    if (error.classList.contains('fade-in')) {
        error.style.display = 'none';
        error.classList.remove('fade-in2');
        error.offsetWidth;
        error.classList.add('fade-in');
        error.style.display = 'block';
    } else {
        error.classList.add('fade-in');
    }
}

function processData(weatherData) {
    // grab all the data i want to display on the page
    const myData = {
        condition: weatherData.weather[0].description,
        feelsLike: {
            c: weatherData.main.feels_like,
        },
        visibility: weatherData.visibility,
        currentTemp: {
            c: weatherData.main.temp,
        },
        wind: weatherData.wind.speed,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        location: weatherData.name.toUpperCase(),
        dateTime: getDateFromTimestamp(weatherData.dt),
        country: weatherData.sys.country,
        sunrise: getHrFromTimestamp(weatherData.sys.sunrise),
        sunset: getHrFromTimestamp(weatherData.sys.sunset),
        tempmin: weatherData.main.temp_min,
        tempmax: weatherData.main.temp_max,
    };
    return myData;
}

function processAlertsData(weatherAlertsData) {
    // grab all the data i want to display on the page
    console.log(weatherAlertsData);
    const myAlertsData = {
        sender: weatherAlertsData.alerts[0].sender_name,
        event: weatherAlertsData.alerts[0].event,
        eventStartDate: getDateFromTimestamp(weatherAlertsData.alerts[0].start), //timestamp
        eventEventDate: getDateFromTimestamp(weatherAlertsData.alerts[0].end), //timestamp
        eventDescription: weatherAlertsData.alerts[0].description, //timestamp
    };
    return myAlertsData;
}

function processPollutantsData(pollutantsData) {
    // grab all the data i want to display on the page
    const myPollutantsData = {
        co: pollutantsData.list[0].components.co,
        no: pollutantsData.list[0].components.no,
        no2: pollutantsData.list[0].components.no2,
        o3: pollutantsData.list[0].components.o3,
        so2: pollutantsData.list[0].components.so2,
        pm2_5: pollutantsData.list[0].components.pm2_5,
        pm10: pollutantsData.list[0].components.pm10,
        nh3: pollutantsData.list[0].components.nh3,
    };

    return myPollutantsData;
}
function displayAlertsData(newAlertsData) {
    const weatherAlertsInfo = document.getElementsByClassName('info');
    document.querySelector(
        '.sender'
    ).textContent = `Sender: ${newAlertsData.sender}`;
    document.querySelector(
        '.event'
    ).textContent = `Event: ${newAlertsData.event}`;
    document.querySelector(
        '.eventstartdate'
    ).textContent = `Event Start Date: ${newAlertsData.eventStartDate}`;
    document.querySelector(
        '.eventenddate'
    ).textContent = `Event End Date: ${newAlertsData.eventEndDate}`;
    document.querySelector(
        '.eventdescription'
    ).textContent = `Event Description: ${newAlertsData.eventDescription}`;
}
function displayPollutantsData(newPollutantsData) {
    const weatherInfo = document.getElementsByClassName('info');
    document.querySelector(
        '.co'
    ).textContent = `Carbon Monoxide: ${newPollutantsData.co}`;
    document.querySelector(
        '.no'
    ).textContent = `Nitric Oxide: ${newPollutantsData.no}`;
    document.querySelector(
        '.no2'
    ).textContent = `Nitrogen Dioxide: ${newPollutantsData.no2}`;
    document.querySelector(
        '.o3'
    ).textContent = `Ozone: ${newPollutantsData.o3}`;
    document.querySelector(
        '.so2'
    ).textContent = `Sulphur Dioxide: ${newPollutantsData.so2}`;
    document.querySelector(
        '.pm2_5'
    ).textContent = `Fine Particles2.5: ${newPollutantsData.pm2_5}`;
    document.querySelector(
        '.pm10'
    ).textContent = `Fine Particles10: ${newPollutantsData.pm10}`;
    document.querySelector(
        '.nh3'
    ).textContent = `Ammonia: ${newPollutantsData.nh3}`;
}





function displayData(newData) {
    const weatherInfo = document.getElementsByClassName('info');
    Array.from(weatherInfo).forEach((div) => {
        if (div.classList.contains('fade-in2')) {
            div.classList.remove('fade-in2');
            div.offsetWidth;
            div.classList.add('fade-in2');
        } else {
            div.classList.add('fade-in2');
        }
    });
  document.querySelector('.current-temperature__value').textContent = `${newData.currentTemp.c}`;
    document.querySelector('.current-temperature__summary').textContent = newData.condition;
    document.querySelector(
        '.location-and-date__location'
    ).textContent = `${newData.location}, ${newData.country}`;
    // document.querySelector(
    //     '.location-and-date__location'
    // ).textContent = `${newData.dateTime}`;
    //
    // document.querySelector(
    //     '.feels-like'
    // ).textContent = `FEELS LIKE: ${newData.feelsLike.c}`;
    // document.querySelector('.wind-mph').textContent = `WIND: ${newData.wind} KMH`;
    // document.querySelector(
    //     '.humidity'
    // ).textContent = `HUMIDITY: ${newData.humidity}`;
    // document.querySelector(
    //     '.pressure'
    // ).textContent = `PRESSURE: ${newData.pressure}`;
    // document.querySelector(
    //     '.visibility'
    // ).textContent = `VISIBILITY: ${newData.visibility}`;
    document.querySelector(
        '.current-stats_value_sunrise'
    ).textContent = `${newData.sunrise}`;
    document.querySelector(
        '.current-stats_value_sunset'
    ).textContent = `${newData.sunset}`;
  document.querySelector(
    '.current-stats_value_temp_max'
  ).textContent = `${newData.tempmax}`;
  document.querySelector(
    '.current-stats_value_temp_min'
  ).textContent = `${newData.tempmin}`;
  document.querySelector(
    '.current-stats_value_wind'
  ).textContent = `${newData.wind}`;
  document.querySelector(
    '.current-stats_value_feel'
  ).textContent = `${newData.feelsLike.c}`;
}




