const FLAG_EMOJI = {
    '中国': '🇨🇳', '中国香港': '🇭🇰', '中国台湾': '🇨🇳',
    '美国': '🇺🇸', '日本': '🇯🇵', '韩国': '🇰🇷',
    '英国': '🇬🇧', '德国': '🇩🇪', '法国': '🇫🇷', '欧盟': '🇪🇺',
    '印度': '🇮🇳', '俄罗斯': '🇷🇺', '以色列': '🇮🇱', '伊朗': '🇮🇷',
    '沙特': '🇸🇦', '巴西': '🇧🇷', '澳大利亚': '🇦🇺', '加拿大': '🇨🇦',
    '东南亚': '🌏', '全球': '🌐'
};

export class MapManager {
    constructor(containerId, location, layers) {
        this.map = null;
        this.markers = new Map();
        this.polygons = new Map();
        this.init(containerId, location, layers);
    }

    async init(containerId, location, layers) {
        await ymaps3.ready;
        const { YMap, YMapFeature, YMapMarker } = ymaps3;
        this.map = new YMap(
            document.getElementById(containerId),
            { location, showScaleInCopyrights: true },
            layers
        );
        this.YMapFeature = YMapFeature;
        this.YMapMarker = YMapMarker;
    }

    addCity(cityData, onCityClick, newsCount = 0) {
        // 不给"全球"画多边形
        if (cityData.name !== '全球') {
            this.addPolygon(cityData, onCityClick);
        }
        this.addMarker(cityData, onCityClick, newsCount);
    }

    addPolygon(cityData, onClick) {
        const polygon = new this.YMapFeature({
            geometry: { type: 'Polygon', coordinates: [cityData.coordinates] },
            id: cityData._id,
            style: window.POLYGON_STYLE,
            properties: { _id: cityData._id },
            onClick: () => onClick(cityData._id, 'polygon')
        });
        this.polygons.set(cityData._id, polygon);
        this.map.addChild(polygon);
    }

    addMarker(cityData, onClick, newsCount = 0) {
        const markerElement = this.createMarkerElement(cityData, newsCount);
        const marker = new this.YMapMarker({
            coordinates: cityData.center,
            onClick: () => onClick(cityData._id, 'marker')
        }, markerElement);
        this.markers.set(cityData._id, marker);
        this.map.addChild(marker);
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
            polygon.update({ style: isActive ? window.POLYGON_STYLE_ACTIVE : window.POLYGON_STYLE });
        }
    }

    hideCityOnMap(cityId) {
        const marker = this.markers.get(cityId);
        if (marker) {
            this.map.removeChild(marker);
            this.markers.delete(cityId);
        }
        const polygon = this.polygons.get(cityId);
        if (polygon) {
            this.map.removeChild(polygon);
            this.polygons.delete(cityId);
        }
    }
}
