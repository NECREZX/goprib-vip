let map;
let marker;

document.addEventListener('DOMContentLoaded', () => {
    // Splash Screen timeout
    setTimeout(() => {
        showScreen('home-screen');
    }, 2000);
});

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function selectService(service) {
    if (service === 'goride') {
        goToMap();
    } else {
        const popup = document.getElementById('service-popup');
        popup.style.display = 'flex';
    }
}

function closePopup() {
    document.getElementById('service-popup').style.display = 'none';
}

function goToHome() {
    showScreen('home-screen');
}

async function getAddress(lat, lng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await response.json();
        return data.display_name.split(',')[0] + ', ' + data.display_name.split(',')[1];
    } catch (error) {
        return "Lokasi tidak diketahui";
    }
}

function goToMap() {
    showScreen('map-screen');
    
    setTimeout(() => {
        if (!map) {
            // Default to Bandung RSUD Hasan Sadikin as per screenshot mockup area
            const defaultPos = [-6.8915, 107.598]; 
            map = L.map('map', {
                zoomControl: false,
                attributionControl: false
            }).setView(defaultPos, 16);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            
            // Custom Icon for marker if needed, else default
            marker = L.marker(defaultPos, {draggable: true}).addTo(map);
            
            marker.on('dragend', async function(e) {
                const pos = e.target.getLatLng();
                updateAddressUI(pos.lat, pos.lng);
            });

            map.on('move', function() {
                const center = map.getCenter();
                marker.setLatLng(center);
            });

            map.on('moveend', async function() {
                const center = map.getCenter();
                updateAddressUI(center.lat, center.lng);
            });
            
            updateAddressUI(defaultPos[0], defaultPos[1]);
        } else {
            map.invalidateSize();
        }

        // Geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                map.setView([lat, lng], 17);
                marker.setLatLng([lat, lng]);
                updateAddressUI(lat, lng);
            });
        }
    }, 200);
}

async function updateAddressUI(lat, lng) {
    document.getElementById('current-address').textContent = "Mencari alamat...";
    const address = await getAddress(lat, lng);
    document.getElementById('current-address').textContent = address;
    document.getElementById('loc-status').textContent = address;
}

function startFinding() {
    showScreen('loading-screen');
    
    const messages = [
        "Mencari supir khusus buatmu...",
        "Menghubungi server cinta...",
        "Membangunkan mas pacar ganteng...",
        "Menyiapkan helm & jaket...",
        "Yeayy dapet!"
    ];
    
    const loadingText = document.getElementById('loading-text');
    let currentIndex = 0;
    
    const interval = setInterval(() => {
        currentIndex++;
        if (currentIndex < messages.length) {
            loadingText.textContent = messages[currentIndex];
        } else {
            clearInterval(interval);
            setTimeout(() => {
                showScreen('result-screen');
            }, 1000);
        }
    }, 1500); 
}

function chatWA() {
    const phoneNumber = "6281279164076"; 
    const message = encodeURIComponent("Halo mas supir favoritku, jemput aku dong sekarang! ❤️");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
}
