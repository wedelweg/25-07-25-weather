const jokeDiv = document.getElementById('joke');
const weatherDiv = document.getElementById('weather');
const btn = document.getElementById('fetchData');

const api_key = '21fed0451ccb85d629cdec6f9b60cd11';

async function loadJoke() {
    try {
        const response = await fetch('https://official-joke-api.appspot.com/random_joke');
        const data = await response.json();

        jokeDiv.innerHTML = `
      <p class="joke-setup">${data.setup}</p>
      <p class="joke-punchline"><strong>${data.punchline}</strong></p>
    `;
    } catch (err) {
        jokeDiv.innerHTML = '<p style="color:red;">Ошибка загрузки шутки</p>';
        console.error(err);
    }
}

async function getWeather(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${api_key}&units=metric&lang=ru`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.cod !== 200) {
            weatherDiv.textContent = `Ошибка: ${data.message}`;
            return;
        }

        const temp = data.main.temp;
        const pressure = data.main.pressure;
        const humidity = data.main.humidity;
        const country = data.sys.country;
        const name = data.name;

        weatherDiv.innerHTML = `
      <p><strong>${name}, ${country}</strong></p>
      <p>Температура: ${temp} °C</p>
      <p>Давление: ${pressure} hPa</p>
      <p>Влажность: ${humidity}%</p>
    `;
    } catch (err) {
        weatherDiv.textContent = 'Ошибка при получении погоды.';
        console.error(err);
    }
}

btn.addEventListener('click', () => {
    const city = document.getElementById('city').value.trim();

    if (!city) {
        weatherDiv.textContent = 'Введите название города.';
        return;
    }

    loadJoke();
    getWeather(city);
});
