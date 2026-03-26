import { formatDate } from '../utils/dateFormatter.js';
import { FavoritesService } from '../api/favorites.js';
import { AuthManager } from '../api/auth.js';

const FLAG_EMOJI = {
    '中国':'🇨🇳','中国香港':'🇭🇰','中国台湾':'🇨🇳','美国':'🇺🇸','日本':'🇯🇵','韩国':'🇰🇷',
    '英国':'🇬🇧','德国':'🇩🇪','法国':'🇫🇷','欧盟':'🇪🇺','印度':'🇮🇳','俄罗斯':'🇷🇺',
    '以色列':'🇮🇱','伊朗':'🇮🇷','沙特':'🇸🇦','巴西':'🇧🇷','澳大利亚':'🇦🇺','加拿大':'🇨🇦',
    '东南亚':'🌏','全球':'🌐'
};

class NewsItemManager {
    constructor() {
        this.authManager = new AuthManager();
        this.favoriteNews = [];
        this.favoriteCities = [];
        this.favoriteSources = [];
        this.isProcessing = false;
        this.loadFavorites();
        this.initializeLikeHandlers();
    }

    async loadFavorites() {
        this.favoriteNews = await FavoritesService.getFavorites('news');
        this.favoriteCities = await FavoritesService.getFavorites('cities');
        this.favoriteSources = await FavoritesService.getFavorites('sources');
    }

    isNewsLiked(id) { return this.favoriteNews.some(i => i._id === id); }
    isCityLiked(id) { return this.favoriteCities.some(i => i._id === id); }
    isSourceLiked(id) { return this.favoriteSources.some(i => i._id === id); }

    createNewsItem(item) {
        const name = item.place_id?.name || '全球';
        const flag = FLAG_EMOJI[name] || '🌐';
        const src = item.source_id;
        const url = item.newsUrl || '';
        const isGenericUrl = !url || url === 'https://www.jin10.com/flash' || url === 'https://www.jin10.com' || url === 'https://www.jin10.com/';

        // 收集所有数据源（主源 + 额外源）
        const allSources = [];
        if (src) allSources.push(src);
        if (item._extraSources) {
            item._extraSources.forEach(s => {
                if (s && !allSources.some(a => a._id === s._id)) allSources.push(s);
            });
        }
        const sourceTags = allSources.map(s =>
            `<span class="new-source-tag">
                ${s.imageUrl ? `<img src="${s.imageUrl}" class="new-source-icon" onerror="this.style.display='none'">` : ''}
                ${s.title || ''}
            </span>`
        ).join('');

        return `
            <div class="new__item compact">
                <div class="new__item-header">
                    <span class="new-flag">${flag}</span>
                    <span class="new-country">${name}</span>
                    <span class="new-time">${formatDate(item.dateTime)}</span>
                    ${sourceTags}
                    ${isGenericUrl ? '' : `<span class="new__actions">
                        <a href="${url}" class="open-new-compact" target="_blank">查看原文</a>
                        <div class="share-btn-sm" onclick="clipboard('${url}')">
                            <img src="./src/images/icons/share.png" alt="" class="share-img-sm">
                        </div>
                    </span>`}
                </div>
                <p class="new__title-compact">${item.title || '无标题'}</p>
                ${item.text && item.text !== item.title ? `<p class="new__text-compact">${item.text}</p>` : ''}
            </div>
        `;
    }

    initializeLikeHandlers() {
        const c = document.querySelector('.news_container');
        if (!c) return;
        c.removeEventListener('click', this.handleLikeClick);
        c.addEventListener('click', this.handleLikeClick.bind(this));
    }

    handleLikeClick = async (event) => {
        const button = event.target.closest('button[data-type]');
        if (!button || this.isProcessing) return;
        const type = button.dataset.type;
        const itemId = button.dataset.id;
        if (!type || !itemId) return;
        try {
            this.isProcessing = true;
            button.classList.add('processing');
            const liked = this.isItemLiked(type, itemId);
            button.classList.toggle('active', !liked);
            if (liked) { await FavoritesService.removeFavorite(type, itemId); this.removeFavoriteLocally(type, itemId); }
            else { await FavoritesService.addFavorite(type, itemId); this.addFavoriteLocally(type, itemId); }
        } catch (e) { console.error('收藏操作错误:', e); button.classList.toggle('active'); }
        finally { this.isProcessing = false; button.classList.remove('processing'); }
    }

    isItemLiked(type, id) {
        if (type === 'news') return this.isNewsLiked(id);
        if (type === 'cities') return this.isCityLiked(id);
        if (type === 'sources') return this.isSourceLiked(id);
        return false;
    }
    addFavoriteLocally(type, id) {
        const arr = type === 'news' ? this.favoriteNews : type === 'cities' ? this.favoriteCities : this.favoriteSources;
        if (!arr.some(i => i._id === id)) arr.push({ _id: id });
    }
    removeFavoriteLocally(type, id) {
        if (type === 'news') this.favoriteNews = this.favoriteNews.filter(i => i._id !== id);
        else if (type === 'cities') this.favoriteCities = this.favoriteCities.filter(i => i._id !== id);
        else this.favoriteSources = this.favoriteSources.filter(i => i._id !== id);
    }
}

export const newsItemManager = new NewsItemManager();
