const FLAG_EMOJI = {
    '中国': '🇨🇳', '中国香港': '🇭🇰', '中国台湾': '🇨🇳',
    '美国': '🇺🇸', '日本': '🇯🇵', '韩国': '🇰🇷',
    '英国': '🇬🇧', '德国': '🇩🇪', '法国': '🇫🇷', '欧盟': '🇪🇺',
    '印度': '🇮🇳', '俄罗斯': '🇷🇺', '以色列': '🇮🇱', '伊朗': '🇮🇷',
    '沙特': '🇸🇦', '巴西': '🇧🇷', '澳大利亚': '🇦🇺', '加拿大': '🇨🇦',
    '东南亚': '🌏', '全球': '🌐'
};

export class MapManager {
    constructor(containerId, location) {
        this.markers = new Map();
        this.polygons = new Map();
        this.init(containerId, location);
    }

    init(containerId, location) {
        this.map = L.map(containerId, {
            center: [location.center[1], location.center[0]], // Leaflet uses [lat, lng]
            zoom: location.zoom,
            zoomControl: false,
            attributionControl: false,
            worldCopyJump: true
        });

        // 高德矢量地图瓦片（中文标注）
        L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
            subdomains: '1234',
            maxZoom: 18,
            tileSize: 256
        }).addTo(this.map);
    }

    addCity(cityData, onCityClick, newsCount = 0) {
        if (cityData.name !== '全球') {
            this.addPolygon(cityData, onCityClick);
        }
        this.addMarker(cityData, onCityClick, newsCount);
    }

    addPolygon(cityData, onClick) {
        // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
        const latLngs = cityData.coordinates.map(c => [c[1], c[0]]);
        const polygon = L.polygon(latLngs, {
            color: 'rgba(255,225,0,0.3)',
            weight: 1,
            fillColor: 'rgba(255,225,0,0.05)',
            fillOpacity: 1
        }).addTo(this.map);
        polygon.on('click', () => onClick(cityData._id, 'polygon'));
        polygon._cityId = cityData._id;
        this.polygons.set(cityData._id, polygon);
    }

    addMarker(cityData, onClick, newsCount = 0) {
        const markerElement = this.createMarkerElement(cityData, newsCount);
        const icon = L.divIcon({
            html: markerElement.outerHTML,
            className: 'leaflet-marker-custom',
            iconSize: null,
            iconAnchor: [0, 0]
        });
        // Leaflet uses [lat, lng]
        const marker = L.marker([cityData.center[1], cityData.center[0]], { icon })
            .addTo(this.map);
        marker.on('click', () => onClick(cityData._id, 'marker'));
        this.markers.set(cityData._id, marker);
    }

    createMarkerElement(cityData, newsCount = 0) {
        const div = document.createElement('div');
        div.classList.add('marker');
        div.id = `marker_${cityData._id}`;

        const flag = FLAG_EMOJI[cityData.name] || '🌐';
        const emoji = document.createElement('span');
        emoji.textContent = flag;
        emoji.style.fontSize = '16px';
        emoji.classList.add('marker-emoji');
        div.appendChild(emoji);

        const name = document.createElement('p');
        name.innerText = cityData.name;
        name.classList.add('marker-text');
        div.appendChild(name);

        if (newsCount > 0) {
            const badge = document.createElement('span');
            badge.className = 'marker-badge';
            badge.textContent = newsCount;
            div.appendChild(badge);
        }

        return div;
    }

    updatePolygonStyle(cityId, isActive) {
        const polygon = this.polygons.get(cityId);
        if (polygon) {
            if (isActive) {
                polygon.setStyle({ color: 'rgba(255,225,0,0.7)', weight: 2, fillColor: 'rgba(255,225,0,0.2)', fillOpacity: 1 });
            } else {
                polygon.setStyle({ color: 'rgba(255,225,0,0.3)', weight: 1, fillColor: 'rgba(255,225,0,0.05)', fillOpacity: 1 });
            }
        }
    }

    hideCityOnMap(cityId) {
        const marker = this.markers.get(cityId);
        if (marker) {
            this.map.removeLayer(marker);
            this.markers.delete(cityId);
        }
        const polygon = this.polygons.get(cityId);
        if (polygon) {
            this.map.removeLayer(polygon);
            this.polygons.delete(cityId);
        }
    }
}
