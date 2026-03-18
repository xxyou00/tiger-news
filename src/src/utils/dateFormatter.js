export const formatDate = (dateString) => {
    if (!dateString) return '12:00';
    
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    
    const time = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    if (dateOnly.getTime() === todayOnly.getTime()) {
        return `今天 ${time}`;
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
        return `昨天 ${time}`;
    }
    
    const dateStr = date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    return `${dateStr} ${time}`;
};
