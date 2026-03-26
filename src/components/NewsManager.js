import { fetchNews } from '../api/news.js';
import { newsItemManager } from './NewsItem.js';

export class NewsManager {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 1;
        this.isLoading = false;
        this.selectedCities = [];
        this.selectedSources = [];
        this.searchQuery = '';
        this.searchTimer = null;
        this.observer = null;
        this.initializeListeners();
        this.initInfiniteScroll();
    }

    initializeListeners() {
        document.getElementById('date-start').addEventListener('change', () => this.resetAndLoad());
        document.getElementById('date-end').addEventListener('change', () => this.resetAndLoad());
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimer);
                this.searchTimer = setTimeout(() => {
                    this.searchQuery = e.target.value.trim();
                    this.resetAndLoad();
                }, 400);
            });
        }
    }

    initInfiniteScroll() {
        const sentinel = document.getElementById('scroll-sentinel');
        if (!sentinel) return;
        const isMobile = window.innerWidth <= 768;
        this.observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !this.isLoading && this.currentPage < this.totalPages) {
                this.loadMore();
            }
        }, { root: isMobile ? null : document.querySelector('.main'), threshold: 0.1 });
        this.observer.observe(sentinel);
    }

    async resetAndLoad() {
        this.currentPage = 1;
        this.totalPages = 1;
        const container = document.querySelector('.news_container');
        container.innerHTML = '';
        await this.updateNews(1);
    }

    async loadMore() {
        if (this.currentPage >= this.totalPages) return;
        await this.updateNews(this.currentPage + 1);
    }

    async updateNews(page = 1) {
        if (this.isLoading) return;
        this.isLoading = true;
        this.toggleLoadingIndicator(true);

        const startDate = document.getElementById('date-start').value;
        const endDate = document.getElementById('date-end').value;

        try {
            const response = await fetchNews({
                cities: this.selectedCities,
                sources: this.selectedSources,
                search: this.searchQuery || undefined,
                startDate: startDate ? new Date(startDate).toISOString() : undefined,
                endDate: endDate ? new Date(endDate + 'T23:59:59.999Z').toISOString() : undefined,
                page,
                limit: 20
            });

            await newsItemManager.loadFavorites();
            this.currentPage = response.page;
            this.totalPages = response.totalPages;

            this.renderNews(response.news, page > 1);
            newsItemManager.initializeLikeHandlers();
        } catch (e) {
            console.error('加载新闻错误:', e);
        } finally {
            this.isLoading = false;
            this.toggleLoadingIndicator(false);
        }
    }

    toggleLoadingIndicator(show) {
        const el = document.getElementById('loading-indicator');
        if (el) el.style.display = show ? 'block' : 'none';
    }

    renderNews(news, append = false) {
        const container = document.querySelector('.news_container');
        if (!append) container.innerHTML = '';

        if (!Array.isArray(news)) {
            console.error('数据格式错误:', news);
            return;
        }

        // 合并同标题新闻
        const merged = [];
        const titleMap = new Map();
        news.forEach(item => {
            if (!item || typeof item !== 'object') return;
            const title = (item.title || '').trim();
            if (titleMap.has(title)) {
                const existing = titleMap.get(title);
                if (item.source_id) existing._extraSources.push(item.source_id);
                if (item.newsUrl && item.newsUrl !== existing.newsUrl) {
                    existing._extraUrls.push(item.newsUrl);
                }
            } else {
                item._extraSources = [];
                item._extraUrls = [];
                titleMap.set(title, item);
                merged.push(item);
            }
        });

        merged.forEach(item => {
            container.insertAdjacentHTML('beforeend', newsItemManager.createNewsItem(item));
        });
    }

    updateCity(cityId, isActive) {
        if (isActive) {
            this.selectedCities = this.selectedCities.filter(id => id !== cityId);
        } else {
            this.selectedCities.push(cityId);
        }
        this.resetAndLoad();
    }

    updateSource(sourceId, isActive) {
        if (isActive) {
            this.selectedSources = this.selectedSources.filter(id => id !== sourceId);
        } else {
            this.selectedSources.push(sourceId);
        }
        this.resetAndLoad();
    }
}
