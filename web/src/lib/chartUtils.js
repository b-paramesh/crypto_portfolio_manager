/**
 * Processes and aggregates crypto time-series data for consistent charting.
 * 
 * @param {Array} data - Array of objects with timestamp and price
 * @param {string} timeframe - 1D, 7D, 1M, 1Y
 * @returns {Array} Formatted data for Recharts
 */
export const processChartData = (data, timeframe) => {
    if (!data || data.length === 0) return [];

    // 1. Sort by timestamp strictly ASC
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // 2. Identify buckets and formats
    let bucketMs;
    let labelFormat;
    const now = new Date();

    switch (timeframe) {
        case '1D':
            bucketMs = 60 * 60 * 1000; // 1 hour
            labelFormat = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            break;
        case '7D':
            bucketMs = 24 * 60 * 60 * 1000; // 1 day
            labelFormat = (d) => d.toLocaleDateString([], { weekday: 'short' });
            break;
        case '1M':
            bucketMs = 24 * 60 * 60 * 1000; // 1 day
            labelFormat = (d) => d.toLocaleDateString([], { day: '2-digit', month: 'short' });
            break;
        case '1Y':
            bucketMs = 30 * 24 * 60 * 60 * 1000; // ~1 month
            labelFormat = (d) => d.toLocaleDateString([], { month: 'short', year: '2-digit' });
            break;
        default:
            bucketMs = 24 * 60 * 60 * 1000;
            labelFormat = (d) => d.toLocaleDateString();
    }

    // 3. Aggregate by bucket (using last price in bucket - closing price)
    const buckets = {};

    sortedData.forEach(item => {
        const date = new Date(item.timestamp);
        const bucketKey = Math.floor(date.getTime() / bucketMs) * bucketMs;

        // Always take the latest one in that bucket
        buckets[bucketKey] = {
            timestamp: bucketKey,
            value: item.price || item.value,
            fullDate: date
        };
    });

    // 4. Convert back to array and format labels
    return Object.keys(buckets)
        .sort((a, b) => Number(a) - Number(b))
        .map(key => {
            const bucket = buckets[key];
            return {
                name: labelFormat(bucket.fullDate),
                value: bucket.value,
                timestamp: bucket.timestamp,
                dateStr: bucket.fullDate.toLocaleString()
            };
        });
};
