const weatherApiKey = "21fed0451ccb85d629cdec6f9b60cd11";

const cityInput = document.getElementById("city");
const suggestionList = document.getElementById("suggestions");
const fetchDataButton = document.getElementById("fetchData");

async function fetchJoke() {
    const res = await fetch("https://v2.jokeapi.dev/joke/Any?lang=en&type=single");
    const data = await res.json();
    return data.joke || "No joke found.";
}

async function fetchWeather(city) {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${weatherApiKey}&units=metric&lang=en`);
    if (!res.ok) throw new Error("Weather not found");
    return await res.json();
}

async function setFlagBackground(countryCode) {
    try {
        const res = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        const data = await res.json();
        const flagUrl = data[0].flags.svg;
        document.body.style.backgroundImage = `url('${flagUrl}')`;
    } catch (error) {
        console.error("Could not load country flag:", error);
        document.body.style.backgroundImage = "none";
    }
}

function displayWeather(data) {
    const { name, main, weather, sys } = data;
    const temp = main.temp;
    const pressure = main.pressure;
    const humidity = main.humidity;
    const description = weather[0].description;
    const country = sys.country;

    document.getElementById("weather").innerHTML =
        `<strong>Weather in ${name}, ${country}:</strong>` +
        `<b>Temperature:</b> ${temp}°C<br>` +
        `<b>Humidity:</b> ${humidity}%<br>` +
        `<b>Pressure:</b> ${pressure} hPa<br>` +
        `<i>${description}</i>`;
}

fetchDataButton.addEventListener("click", async () => {
    const city = cityInput.value.trim();
    if (!city) return;

    document.getElementById("joke").textContent = "Loading joke...";
    document.getElementById("weather").textContent = "Loading weather...";
    document.body.style.backgroundImage = "none";

    try {
        const [joke, weatherData] = await Promise.all([
            fetchJoke(),
            fetchWeather(city)
        ]);

        document.getElementById("joke").textContent = joke;
        displayWeather(weatherData);
        setFlagBackground(weatherData.sys.country);
    } catch (error) {
        console.error(error);
        document.getElementById("weather").textContent = "Error fetching data.";
    }
});

let debounceTimer;
cityInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        handleCityInput(cityInput.value.trim());
    }, 400);
});

async function handleCityInput(query) {
    if (query.length < 2) {
        suggestionList.innerHTML = "";
        return;
    }

    const cities = await fetchCitySuggestions(query);
    suggestionList.innerHTML = "";

    cities.forEach(place => {
        const li = document.createElement("li");
        li.textContent = place.display_name;
        li.addEventListener("click", () => {
            cityInput.value = place.display_name;
            suggestionList.innerHTML = "";
        });
        suggestionList.appendChild(li);
    });
}

async function fetchCitySuggestions(query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&accept-language=en&q=${encodeURIComponent(query)}`;
    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "weather-joke-app/1.0"
            }
        });
        if (!res.ok) throw new Error("Nominatim request failed");
        return await res.json();
    } catch (error) {
        console.error("Nominatim error:", error);
        return [];
    }
}
