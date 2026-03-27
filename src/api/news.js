import { API_BASE_URL } from '../config.js';

export const fetchNews = async (params) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.cities && params.cities.length > 0) {
            params.cities.forEach(city => queryParams.append('city', city));
        }
        if (params.sources && params.sources.length > 0) {
            params.sources.forEach(source => queryParams.append('source', source));
        }
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await fetch(`${API_BASE_URL}/api/news?${queryParams.toString()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            credentials: 'omit',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('获取新闻错误:', error);
        return { news: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }
};

export const fetchCities = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/cities`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            credentials: 'omit',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('获取国家/地区错误:', error);
        document.getElementById('preloader')?.classList.add('hidden');
        return [];
    }
};

export const fetchSources = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/sources`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            credentials: 'omit',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('获取数据源错误:', error);
        document.getElementById('preloader')?.classList.add('hidden');
        return [];
    }
};
