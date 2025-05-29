// Rachel Curry
// May 23rd, 2025
// Fortnite Companion App

const slideContent = document.getElementById('slide-content');
const buttons = document.querySelectorAll('nav button');
const leftBtn = document.querySelector('.left-arrow');
const rightBtn = document.querySelector('.right-arrow');

let currentSlide = 'drop';
let slideInterval;
const slideDuration = 13000;
const mapDuration = 43200000;
setInterval(updateDateTime, 20000);

const DATA_URL = 'https://rachelccurry.github.io/fortnite-companion-data/data.json';
const SKIN_URL = 'https://fortnite-api.com/v2/cosmetics/br?type=outfit';

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
    return data.data;
}


// RIGHT PANE FUNCTIONS //
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
});

leftBtn.addEventListener('click', () => {
    leftBtn.classList.add('hidden');
    rightBtn.classList.remove('hidden');
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
    const now = new Date();
    const day = now.toISOString().split('T')[0];
    
    const hash = [...day].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % skins.length;
    return skins[index];
}
fetchSkins().then(skins => {
  const dailySkin = getDailySkin(skins);
  const container = document.getElementById('daily-skin');
  container.innerHTML = `
    <h2 class="skin-title">Skin of the Day</h2>
    <img src="${dailySkin.images.icon}" alt="${dailySkin.name}" style="width:100%">
    <p class="skin-name">${dailySkin.name}</p>
  `;
});

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateStr = now.toLocaleDateString(undefined, options);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    document.getElementById('date-display').textContent = dateStr;
    document.getElementById('time-display').textContent = timeStr;
}

// RENDER DATA //
fetchData().then(() => {
    showSlide('drop');
    updateDateTime();
    renderBackground();
});
