import {giphy_API_KEY, giphy_URL} from "./giphyAPI.js";
import {weather_API_KEY, weather_URL, weather_unitGroup, weather_contentType} from "./weatherAPI.js";
import "./styles.css";

// import clearDay from "./images/clear-day.png"
//
// console.log(clearDay)

const importAll = require =>
    require.keys().reduce((acc, next) => {
        acc[next.replace("./", "")] = require(next);
        return acc;
    }, {});

const images = importAll(
    require.context("./images", false, /\.(png|jpe?g|svg)$/)
);

const env = "PROD";

// QUERY SELECTORS
const weatherResult = document.querySelector("#weatherResult");
const giphyResult = document.querySelector("#giphyResult");
const btnFetch = document.querySelector("#btnFetch");
const weatherForm = document.querySelector("#weatherForm");
const giphy = document.querySelector(".giphy");
const icon = document.querySelector(".icon");

// FUNCTIONS
const renderResult = function (result, container) {
    let condition = result.currentConditions.conditions;
    let icon = result.currentConditions.icon;
    const markup = `<p class="title">Address:</p><p>${result.resolvedAddress}</p><p class="title">Latitude:</p> <p>${result.latitude < 0 ? `${Math.abs(result.latitude)} \u00B0 S` : `${Math.abs(result.latitude)} \u00B0 N`}</p><p class="title">Longitude:</p><p>${result.longitude < 0 ? `${Math.abs(result.longitude)} \u00B0 W` : `${Math.abs(result.longitude)} \u00B0 E`}</p><p class="title">Description:</><p>${result.description}</p><p class="title">Current Temperature:</p><p>${result.currentConditions.temp} \u00B0 C</p><p class="title">Current Condition:</p><p>${condition}</p>`;
    container.insertAdjacentHTML("beforeend", markup);
    let gifCall = `${giphy_URL}?key=${giphy_API_KEY}&s=${condition}`
    fetchGif(gifCall, giphyResult);
    renderImg(icon);
};

const renderGif = function (result) {
    let src = result.data.images.original.url;
    giphy.src = src;
};

const renderImg = function (logo) {
    const src = images[`${logo}.png`];
    console.log(src)
    icon.src = src;
    icon.classList.remove("hidden");
}

const renderError = function (result, container) {
    const markup = `<p>Error in query. Error: ${result.message}</p>`;
    container.insertAdjacentHTML("beforeend", markup);
};

const fetchGif = async function (url, container) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        renderGif(json);
    } catch (error) {
        console.error(error.message);
        renderError(error, container);
    }
}

const fetchData = async function (url, container) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        renderResult(json, weatherResult);
    } catch (error) {
        console.error(error.message);
        renderError(error, container);
    }
};

const formSubmit = function (form, submitter) {
    let obj = {};
    const formData = new FormData(form, submitter);
    for (const [key, value] of formData) {
        obj[key] = value;
    }
    return obj;
};

// EVENT LISTENERS
weatherForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let data = formSubmit(weatherForm, btnFetch);
    const place = data.place;
    if (place === "") {
        console.log(`No value given`);
    } else {
        const weatherCall = `${weather_URL}${place}?key=${weather_API_KEY}&unitGroup=${weather_unitGroup}&contentType=${weather_contentType}`;
        if (env === "TEST") {
            console.log(`test environment: ${env}`);
        } else {
            weatherResult.innerHTML = "";
            fetchData(weatherCall, weatherResult);
            weatherForm.reset();
        }
    }
});
