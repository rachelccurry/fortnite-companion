// Rachel Curry
// May 23rd, 2025
// Fortnite Companion App

const username = 'noctrnalnavi';

// URLS //
const DATA_URL = 'https://rachelccurry.github.io/fortnite-companion-data/data.json';
const SKIN_URL = 'https://fortnite-api.com/v2/cosmetics/br?type=outfit';
const MAP_URL = 'https://fortnite-api.com/v1/map';
const mapImageUrl = "https://fortnite-api.com/images/map_en.png";
const SHOP_URL = 'https://fortnite-api.com/v2/shop';

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
async function fetchShop() {
    const res = await fetch(SHOP_URL);
    const data = await res.json();
    const entries = data.data.entries || [];
    const allItems = entries.flatMap(entry => entry.brItems || []);
//     const skinsAndEmotes = allItems.filter(item => {
//     const type = item.type?.displayValue?.toLowerCase();
//         return type === 'outfit';
//     // return type === 'outfit' || type === 'emote';
//   });

//   return skinsAndEmotes;
    return allItems;
}
async function loadPlayerStats(username) {
  const res = await fetch(`/api/stats/${username}`);
  const data = await res.json();
  return(data);
}

// SCHEDULER FUNCTIONS //
function scheduleMapUpdates() {
    const sixHrs = 6*60*60*1000;
    setInterval(renderBackground, sixHrs);
}
function schedulePOIUpdates() {
    const thirtyMin = 20*60*1000;
    setInterval(updatePOI, thirtyMin);
}
function scheduleSkinUpdate(){
    const now = new Date();
    const midnight = new Date();

    midnight.setHours(24, 0, 0, 0);
    let timeUntilMidnight = midnight - now;

    setTimeout(() => {
        updateDailySkin();
        setInterval(updateDailySkin, 24*60*60*1000);
    }, timeUntilMidnight);
}
function scheduleShopUpdate(){
    const now = new Date();
    const shopResetTime = new Date();

    shopResetTime.setUTCHours(0, 0, 0, 0);
    if (shopResetTime <= now) {
        shopResetTime.setUTCDate(shopResetTime.getUTCDate() + 1);
    }
    let timeUntilShop = shopResetTime - now;

    setTimeout(() => {
        updateShop();
        setInterval(updateShop, 24*60*60*1000);
    }, timeUntilShop);
}

// L & R SLIDE BUTTONS //
const buttons = document.querySelectorAll('nav button');
const leftBtn = document.querySelector('.left-arrow');
const rightBtn = document.querySelector('.right-arrow');
const slideContent = document.getElementById('slide-content');
const slides = document.querySelectorAll('.skin-slide');
let currentSkinSlide = 0;
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

// BACKGROUND MAP FUNCTIONS //
function getRandomMap() {
    const maps = fortniteData.maps;
    return maps[Math.floor(Math.random() * maps.length)];
}
function renderBackground() {
    if (!fortniteData || !fortniteData.maps) {
        console.error('Map data missing.');
        return;
    }

    let map = getRandomMap();
    
    let bg = document.getElementById('background');
    let label = document.getElementById('season-label');
    let fullMap = document.getElementById('full-map');

    fullMap.style.backgroundImage = `url(${map.image})`;

    if (bg && map.image) {
        bg.style.backgroundImage = `url(${map.image})`;
        bg.style.backgroundSize = 'cover';
        bg.style.backgroundPosition = 'center';
        bg.style.opacity = '0.5';
    } else {
        console.error('Could not find background element or image is missing.');
    }
    if (label && map.label) {
        label.textContent = map.label + ' Map';
    }
}

// MAP POPUP
let popup = document.getElementById('map-popup');
let closeBtn = document.getElementById('close-map');
let label = document.getElementById('season-label');
label.addEventListener('click', () => {
    popup.classList.remove('map-hidden')
});
closeBtn.addEventListener('click', () => {
    popup.classList.add('map-hidden');
});

// LEFT PANE FUNCTIONS //
function getDailySkin(skins) {
    const index = Math.floor(Math.random() * skins.length);
    return skins[index];
}
function updateDailySkin() {
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
}
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
function updatePOI() {
    fetchPOIs().then(POIs => {
        let POI = getRandomPOI(POIs.filter(poi => !poi.id.includes('UnNamedPOI')));

        const container = document.getElementById('drop-spot-name');
        container.innerHTML = `
        <p id="drop-spot-p" class="drop-spot-name">${POI.name}</p>`;

    });
}
function updateShop() {
    fetchShop().then(items => {
    const container = document.getElementById('shop-skins-row');
    container.innerHTML = '';

    items.forEach(item => {
    if (item.images.featured) {
        const card = document.createElement('div');
        card.classList.add('shop-skin-card');
        card.innerHTML = `
        <img src="${item.images.featured}" alt="${item.name}" />
        <p style="margin-top: 2px; text-wrap:wrap;">${item.name}</p>
        `;
        container.appendChild(card);
    }
    });
});
}

// stats here

// RENDER DATA //
fetchData().then(() => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    renderBackground();
    updateDailySkin();
    updatePOI();
    updateShop();
    scheduleMapUpdates();
    schedulePOIUpdates();
    scheduleSkinUpdate();
    scheduleShopUpdate();
});
