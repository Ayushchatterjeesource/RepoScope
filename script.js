/* =========================================
   RepoScope Weather Dashboard
   Fetch API + Async/Await + REST API
========================================= */


/* =========================================
   API CONFIGURATION
========================================= */

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";

const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";


/* =========================================
   DOM ELEMENTS
========================================= */

const searchForm =
    document.getElementById("searchForm");

const cityInput =
    document.getElementById("cityInput");

const searchButton =
    document.getElementById("searchButton");

const loading =
    document.getElementById("loading");

const dashboard =
    document.getElementById("weatherDashboard");

const errorMessage =
    document.getElementById("errorMessage");


const cityName =
    document.getElementById("cityName");

const locationDetails =
    document.getElementById("locationDetails");

const currentDate =
    document.getElementById("currentDate");

const currentTime =
    document.getElementById("currentTime");


const weatherIcon =
    document.getElementById("weatherIcon");

const temperature =
    document.getElementById("temperature");

const feelsLike =
    document.getElementById("feelsLike");

const weatherDescription =
    document.getElementById("weatherDescription");


const metricTemperature =
    document.getElementById("metricTemperature");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("windSpeed");

const pressure =
    document.getElementById("pressure");

const visibility =
    document.getElementById("visibility");

const cloudCover =
    document.getElementById("cloudCover");


const windDirection =
    document.getElementById("windDirection");

const sunrise =
    document.getElementById("sunrise");

const sunset =
    document.getElementById("sunset");

const weatherCode =
    document.getElementById("weatherCode");


/* =========================================
   SEARCH EVENT
========================================= */

searchForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const city =
            cityInput.value.trim();

        if (!city) {

            showError(
                "Please enter a city name."
            );

            return;
        }

        await getWeather(city);
    }
);


/* =========================================
   MAIN WEATHER FUNCTION
========================================= */

async function getWeather(city) {

    showLoading();

    hideError();

    try {

        /*
         * STEP 1
         * Find the city's latitude and longitude
         */

        const location =
            await getLocation(city);


        /*
         * STEP 2
         * Fetch weather using coordinates
         */

        const weather =
            await getWeatherData(
                location.latitude,
                location.longitude
            );


        /*
         * STEP 3
         * Render the received JSON data
         */

        renderWeather(
            location,
            weather
        );


        /*
         * STEP 4
         * Show dashboard
         */

        dashboard.classList.remove(
            "hidden"
        );


        /*
         * STEP 5
         * Scroll to dashboard
         */

        dashboard.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    catch (error) {

        console.error(
            "Weather Error:",
            error
        );

        showError(
            error.message ||
            "Unable to fetch weather data. Please try again."
        );

        dashboard.classList.add(
            "hidden"
        );

    }

    finally {

        hideLoading();

    }
}


/* =========================================
   GET LOCATION
========================================= */

async function getLocation(city) {

    const url =
        `${GEOCODING_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;


    const response =
        await fetch(url);


    /*
     * Network / HTTP error handling
     */

    if (!response.ok) {

        throw new Error(
            "Unable to connect to the location service."
        );
    }


    /*
     * Parse JSON
     */

    const data =
        await response.json();


    /*
     * Check whether city exists
     */

    if (
        !data.results ||
        data.results.length === 0
    ) {

        throw new Error(
            `No location found for "${city}". Please check the city name.`
        );
    }


    /*
     * Return first matching location
     */

    return data.results[0];
}


/* =========================================
   GET WEATHER DATA
========================================= */

async function getWeatherData(
    latitude,
    longitude
) {

    const url =
        `${WEATHER_API}?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m` +
        `&hourly=visibility` +
        `&daily=sunrise,sunset` +
        `&timezone=auto`;


    const response =
        await fetch(url);


    /*
     * Check HTTP response
     */

    if (!response.ok) {

        throw new Error(
            "Weather service returned an error."
        );
    }


    /*
     * Convert response to JSON
     */

    const data =
        await response.json();


    /*
     * Validate nested JSON structure
     */

    if (!data.current) {

        throw new Error(
            "Weather data is unavailable for this location."
        );
    }


    return data;
}


/* =========================================
   RENDER WEATHER
========================================= */

function renderWeather(
    location,
    data
) {

    const current =
        data.current;


    /*
     * LOCATION
     */

    cityName.textContent =
        location.name || "Unknown Location";


    const region =
        location.admin1 ||
        "";

    const country =
        location.country ||
        "";


    locationDetails.textContent =
        `${region}${region && country ? ", " : ""}${country}`;


    /*
     * DATE / TIME
     */

    updateDateTime();


    /*
     * MAIN TEMPERATURE
     */

    const temp =
        current.temperature_2m;


    temperature.textContent =
        Math.round(temp);


    metricTemperature.textContent =
        `${Math.round(temp)}°C`;


    /*
     * FEELS LIKE
     */

    feelsLike.textContent =
        `${Math.round(
            current.apparent_temperature
        )}°C`;


    /*
     * WEATHER CONDITION
     */

    const description =
        getWeatherDescription(
            current.weather_code
        );


    weatherDescription.textContent =
        description;


    /*
     * WEATHER ICON
     */

    weatherIcon.textContent =
        getWeatherIcon(
            current.weather_code
        );


    /*
     * HUMIDITY
     */

    humidity.textContent =
        `${current.relative_humidity_2m}%`;


    /*
     * WIND SPEED
     */

    windSpeed.textContent =
        `${Math.round(
            current.wind_speed_10m
        )} km/h`;


    /*
     * PRESSURE
     */

    pressure.textContent =
        `${Math.round(
            current.pressure_msl
        )} hPa`;


    /*
     * CLOUD COVER
     */

    cloudCover.textContent =
        `${current.cloud_cover}%`;


    /*
     * WIND DIRECTION
     */

    windDirection.textContent =
        `${Math.round(
            current.wind_direction_10m
        )}°`;


    /*
     * VISIBILITY
     *
     * Open-Meteo hourly visibility
     * is returned in meters.
     */

    if (
        data.hourly &&
        data.hourly.visibility &&
        data.hourly.visibility.length > 0
    ) {

        const currentVisibility =
            data.hourly.visibility[0];


        visibility.textContent =
            `${(
                currentVisibility / 1000
            ).toFixed(1)} km`;

    } else {

        visibility.textContent =
            "N/A";
    }


    /*
     * SUNRISE / SUNSET
     */

    if (
        data.daily &&
        data.daily.sunrise &&
        data.daily.sunrise.length > 0
    ) {

        sunrise.textContent =
            formatTime(
                data.daily.sunrise[0]
            );
    }


    if (
        data.daily &&
        data.daily.sunset &&
        data.daily.sunset.length > 0
    ) {

        sunset.textContent =
            formatTime(
                data.daily.sunset[0]
            );
    }


    /*
     * WEATHER CODE
     */

    weatherCode.textContent =
        current.weather_code;
}


/* =========================================
   WEATHER DESCRIPTION
========================================= */

function getWeatherDescription(code) {

    const weatherCodes = {

        0:
            "Clear Sky",

        1:
            "Mainly Clear",

        2:
            "Partly Cloudy",

        3:
            "Overcast",

        45:
            "Fog",

        48:
            "Depositing Rime Fog",

        51:
            "Light Drizzle",

        53:
            "Moderate Drizzle",

        55:
            "Dense Drizzle",

        56:
            "Light Freezing Drizzle",

        57:
            "Dense Freezing Drizzle",

        61:
            "Slight Rain",

        63:
            "Moderate Rain",

        65:
            "Heavy Rain",

        66:
            "Light Freezing Rain",

        67:
            "Heavy Freezing Rain",

        71:
            "Slight Snow",

        73:
            "Moderate Snow",

        75:
            "Heavy Snow",

        77:
            "Snow Grains",

        80:
            "Slight Rain Showers",

        81:
            "Moderate Rain Showers",

        82:
            "Violent Rain Showers",

        85:
            "Slight Snow Showers",

        86:
            "Heavy Snow Showers",

        95:
            "Thunderstorm",

        96:
            "Thunderstorm with Slight Hail",

        99:
            "Thunderstorm with Heavy Hail"

    };


    return (
        weatherCodes[code] ||
        "Unknown Weather"
    );
}


/* =========================================
   WEATHER ICON
========================================= */

function getWeatherIcon(code) {

    if (code === 0) {
        return "☀️";
    }

    if (
        code === 1 ||
        code === 2
    ) {
        return "🌤️";
    }

    if (code === 3) {
        return "☁️";
    }

    if (
        code === 45 ||
        code === 48
    ) {
        return "🌫️";
    }

    if (
        code >= 51 &&
        code <= 67
    ) {
        return "🌧️";
    }

    if (
        code >= 71 &&
        code <= 77
    ) {
        return "❄️";
    }

    if (
        code >= 80 &&
        code <= 82
    ) {
        return "🌦️";
    }

    if (
        code >= 85 &&
        code <= 86
    ) {
        return "🌨️";
    }

    if (
        code >= 95
    ) {
        return "⛈️";
    }

    return "🌤️";
}


/* =========================================
   DATE & TIME
========================================= */

function updateDateTime() {

    const now =
        new Date();


    currentDate.textContent =
        now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    currentTime.textContent =
        now.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );
}


/*
 * Update clock every second
 */

setInterval(
    updateDateTime,
    1000
);


/* =========================================
   FORMAT TIME
========================================= */

function formatTime(
    dateTime
) {

    if (!dateTime) {
        return "-";
    }


    const date =
        new Date(dateTime);


    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================
   LOADING FUNCTIONS
========================================= */

function showLoading() {

    loading.classList.remove(
        "hidden"
    );

    searchButton.disabled =
        true;

    searchButton.textContent =
        "Loading...";
}


function hideLoading() {

    loading.classList.add(
        "hidden"
    );

    searchButton.disabled =
        false;

    searchButton.textContent =
        "Search";
}


/* =========================================
   ERROR FUNCTIONS
========================================= */

function showError(
    message
) {

    errorMessage.textContent =
        message;

    errorMessage.classList.remove(
        "hidden"
    );
}


function hideError() {

    errorMessage.textContent =
        "";

    errorMessage.classList.add(
        "hidden"
    );
}


/* =========================================
   INITIAL CLOCK
========================================= */

updateDateTime();
