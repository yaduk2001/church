export function checkNetworkQuality(): {
    type: string;
    isAllowed: boolean;
    message: string;
    speed?: string;
} {
    // Check if Network Information API is available
    const connection = (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

    if (!connection) {
        return {
            type: 'unknown',
            isAllowed: true,
            message: 'Network detection not supported. Proceeding...',
            speed: 'Unknown'
        };
    }

    const effectiveType = connection.effectiveType;
    const downlink = connection.downlink; // Mbps

    // Block 2G/3G connections
    if (['slow-2g', '2g', '3g'].includes(effectiveType)) {
        return {
            type: effectiveType,
            isAllowed: false,
            message: `Your connection (${effectiveType.toUpperCase()}) is too slow for live streaming. Please use 4G, 5G, or Wi-Fi.`,
            speed: `${downlink} Mbps`
        };
    }

    // Warn for slower 4G
    if (effectiveType === '4g' && downlink < 5) {
        return {
            type: effectiveType,
            isAllowed: true,
            message: 'Your connection speed is on the lower end. You may experience buffering.',
            speed: `${downlink} Mbps`
        };
    }

    return {
        type: effectiveType,
        isAllowed: true,
        message: 'Your connection is suitable for streaming.',
        speed: `${downlink} Mbps`
    };
}

export function getConnectionRecommendation(): string {
    const connection = (navigator as any).connection;

    if (!connection) {
        return 'For best experience, use 4G, 5G, or Wi-Fi connection.';
    }

    const effectiveType = connection.effectiveType;

    switch (effectiveType) {
        case 'slow-2g':
        case '2g':
            return '❌ 2G is not supported. Please switch to 4G, 5G, or Wi-Fi.';
        case '3g':
            return '❌ 3G is too slow. Please switch to 4G, 5G, or Wi-Fi.';
        case '4g':
            return '✅ 4G connection detected. Streaming should work well.';
        default:
            return '✅ Good connection detected.';
    }
}
