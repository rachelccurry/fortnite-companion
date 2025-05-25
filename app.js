// Rachel Curry
// May 23rd, 2025
// Fortnite Companion App

const slideContent = document.getElementById('slide-content');
const buttons = document.querySelectorAll('nav button');

let currentSlide = 'drop';
let slideInterval;
const slideDuration = 13000;
const mapDuration = 43200000;

const DATA_URL = 'https://rachelccurry.github.io/fortnite-companion-data/data.json';

let fortniteData = null;

async function fetchData() {
    try {
        const res = await fetch(DATA_URL);
        if (!res.ok) throw new Error('Failed to fetch data');
        fortniteData = await res.json();
    } catch (e) {
        console.error('Error loading data:', e);
        slideContent.textContent = 'Error loading data :(';
    }
}


// SLIDE FUNCTIONS //
function renderSlide(type) {
    if (!fortniteData) {
        slideContent.textContent = 'Loading...';
        return;
    }
    if (type === 'drop') {
        const spot = fortniteData.dropSpots[Math.floor(Math.random() * fortniteData.dropSpots.length)];
        slideContent.innerHTML = `<h2>🎯 Drop Spot:</h2><p>${spot}</p>`;
    } else if (type === 'loadout') {
        const loadout = fortniteData.loadouts[Math.floor(Math.random() * fortniteData.loadouts.length)];
        slideContent.innerHTML = `<h2>🎒 Loadout:</h2>
        <p>Primary: ${loadout.primary}</p>
        <p>Secondary: ${loadout.secondary}</p>
        <p>Utility: ${loadout.utility}</p>`;
    } else if (type === 'forecast') {
        slideContent.innerHTML = `<h2>🌩 Weather Forecast:</h2><p>${fortniteData.forecast}</p>`;
    }
}

function showSlide(type) {
    currentSlide = type;
    renderSlide(type);
    resetInterval();
}

function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        if (currentSlide === 'drop') showSlide('loadout');
        else if (currentSlide === 'loadout') showSlide('forecast');
        else showSlide('drop');
    }, slideDuration);
}

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        showSlide(btn.getAttribute('data-slide'));
    });
});


// BACKGROUND FUNCTIONS //
function renderBackground() {
    if (!fortniteData || !fortniteData.maps) {
        console.error('Map data missing.');
        return;
    }

    const maps = fortniteData.maps;
    const randomMap = maps[Math.floor(Math.random() * maps.length)];
    const bg = document.getElementById('background');
    const label = document.getElementById('season-label');

    if (bg && randomMap.image) {
        bg.style.backgroundImage = `url(${randomMap.image})`;
        bg.style.backgroundSize = 'cover';
        bg.style.backgroundPosition = 'center';
        bg.style.opacity = '0.5';
    } else {
        console.error('Could not find background element or image is missing.');
    }
    if (label && randomMap.label) {
        label.textContent = randomMap.label + ' Map';
    }
}


// RENDER DATA //
fetchData().then(() => {
    showSlide('drop');
    renderBackground();
});
