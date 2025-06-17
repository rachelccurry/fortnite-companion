// Rachel Curry
// May 23rd, 2025
// Fortnite Companion App

const slideContent = document.getElementById('slide-content');
const buttons = document.querySelectorAll('nav button');
const leftBtn = document.querySelector('.left-arrow');
const rightBtn = document.querySelector('.right-arrow');
const slides = document.querySelectorAll('.skin-slide');
const backupImg = 'https://rachelccurry.github.io/fortnite-companion-data/other/backup.png';
let currentSkinSlide = 0;

let currentSlide = 'drop';
let slideInterval;
const slideDuration = 13000;
const mapDuration = 43200000;
setInterval(updateDateTime, 20000);

const DATA_URL = 'https://rachelccurry.github.io/fortnite-companion-data/data.json';
const SKIN_URL = 'https://fortnite-api.com/v2/cosmetics/br?type=outfit';
const MAP_URL = 'https://fortnite-api.com/v1/map';
const mapImageUrl = "https://fortnite-api.com/images/map_en.png";

let fortniteData = null;


// GET DATA FUNCTIONS //
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

async function fetchSkins() {
    const res = await fetch(SKIN_URL);
    const data = await res.json();
    return data.data.filter(item => item.type.backendValue === 'AthenaCharacter');
}

async function fetchPOIs() {
    const res = await fetch(MAP_URL);
    const data = await res.json();
    return data.data.pois;
}


// BUTTON THINGS //
buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        showSlide(btn.getAttribute('data-slide'));
    });
});

function updateActiveButton(type) {
    buttons.forEach(btn => {
        if (btn.getAttribute('data-slide') === type) {
            btn.classList.add('active');
        } 
        else {
            btn.classList.remove('active');
        }
    });
}

rightBtn.addEventListener('click', () => {
    rightBtn.classList.add('hidden');
    leftBtn.classList.remove('hidden');
    currentSkinSlide = (currentSkinSlide + 1) % slides.length;
    showSkinSlide(currentSkinSlide);
});

leftBtn.addEventListener('click', () => {
    leftBtn.classList.add('hidden');
    rightBtn.classList.remove('hidden');
    currentSkinSlide = (currentSkinSlide - 1 + slides.length) % slides.length;
    showSkinSlide(currentSkinSlide);
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


// LEFT PANE FUNCTIONS //
function getDailySkin(skins) {
    const index = Math.floor(Math.random() * skins.length);
    return skins[index];
}
fetchSkins().then(skins => {
    let dailySkin = getDailySkin(skins);
    while (!dailySkin.images.featured) {
        dailySkin = getDailySkin(skins);
    }
    const container = document.getElementById('daily-skin');
    if (dailySkin.images.featured) {
        container.innerHTML = `
        <h2 class="skin-title">Skin of the Day</h2>
        <img src="${dailySkin.images.featured}" alt="${dailySkin.name}" style="width:100%">
        <p class="skin-name">${dailySkin.name}</p>`;
    }
    else {
        console.error("Skin not loading...");      
    }
    const container2 = document.getElementById('daily-skin-details');
    container2.innerHTML = `
    <h3 class="skin-title">Details</h3>
    <p class="skin-description"><strong style="font-weight: 800;">Description</strong>: ${dailySkin.description}</p>
    <p></p>
    <p class="skin-description"><strong style="font-weight: 800;">Set</strong>: ${dailySkin.set.text}</p>
    <p></p>
    <p class="skin-description"><strong style="font-weight: 800;">Released</strong>: ${dailySkin.introduction.text}</p>
    <p></p>
    <p class="skin-description"><strong style="font-weight: 800;">Rarity</strong>: ${dailySkin.rarity.displayValue}</p>
    <p></p>
  `;
});
function showSkinSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateStr = now.toLocaleDateString(undefined, options);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    document.getElementById('date-display').textContent = dateStr;
    document.getElementById('time-display').textContent = timeStr;
}

// RIGHT PANE FUNCTIONS //
function getRandomPOI(POIs) {
    const index = Math.floor(Math.random() * POIs.length);
    return POIs[index];
}

function convertToPixelCoords(location, imageWidth, imageHeight) {
    const gameCoordMin = -51200;
    const gameCoordMax = 51200;

    const normalizedX = (location.x - gameCoordMin) / (gameCoordMax - gameCoordMin);
    const normalizedY = 1 - (location.y - gameCoordMin) / (gameCoordMax - gameCoordMin); // invert Y

    const x = normalizedX * imageWidth;
    const y = normalizedY * imageHeight;
    return { x, y };
}

fetchPOIs().then(POIs => {
    let POI = getRandomPOI(POIs.filter(poi => !poi.id.includes('UnNamedPOI')));

    const container = document.getElementById('drop-box-left');
    container.innerHTML = `
    <p id="left-drop-box-p" class="mini-box-p">${POI.name}</p>`;

    const container2 = document.getElementById('drop-box-right');
    container2.innerHTML = `
    <div id="mini-map-thumb" class="mini-map-thumb"></div>
    `;

    let mapThumb = document.getElementById('mini-map-thumb');
    mapThumb.style.backgroundPosition = `-${POI.location.x}px -${POI.location.y}px`;

});


function renderSlide(type) {
    if (!fortniteData) {
        slideContent.textContent = 'Loading...';
        return;
    }
    if (type === 'drop') {
        const spot = fortniteData.dropSpots[Math.floor(Math.random() * fortniteData.dropSpots.length)];
        slideContent.innerHTML = `<h2 class="slide-title">🎯 Drop Spot</h2><p class="slide-body">${spot}</p>`;
    } 
    else if (type === 'loadout') {
        const loadout = fortniteData.loadouts[Math.floor(Math.random() * fortniteData.loadouts.length)];
        slideContent.innerHTML = `<h2 class="slide-title">🎒 Loadout</h2>
        <p class="slide-body"><strong>Primary: </strong>${loadout.primary}</p>
        <p class="slide-body"><strong>Secondary: </strong>${loadout.secondary}</p>
        <p class="slide-body"><strong>Utility: </strong>${loadout.utility}</p>`;
    } 
    else if (type === 'forecast') {
        slideContent.innerHTML = `<h2 class="slide-title">🌩 Weather Forecast</h2><p class="slide-body">${fortniteData.forecast}</p>`;
    }
}

function showSlide(type) {
    currentSlide = type;
    renderSlide(type);
    updateActiveButton(type);
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


// RENDER DATA //
fetchData().then(() => {
    showSlide('drop');
    updateDateTime();
    renderBackground();
});
