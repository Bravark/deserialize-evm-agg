// Hermes API endpoint
const HERMES_URL = 'https://hermes.pyth.network';

interface PriceData {
    symbol: string;
    price: number;
    conf: number;
    expo: number;
    publishTime: number;
    priceId: string;
}

interface PriceResult {
    success: boolean;
    data?: PriceData;
    error?: string;
    timestamp: number;
}

interface MultiplePriceResult {
    success: boolean;
    data?: Record<string, PriceData>;
    error?: string;
    timestamp: number;
}

// Stable Price Feed IDs (these are permanent and cross-chain)
const STABLE_PRICE_FEED_IDS: Record<string, string> = {
    'BTC': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    'ETH': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    'SOL': '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    'USDC': '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
    'USDT': '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
    'BNB': '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
    'ADA': '0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d',
    'DOGE': '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
    'MATIC': '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52',
    'AVAX': '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
    'LINK': '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
    'DOT': '0xca3eed9b267293f6595901c734c7525ce8ef49adafe8284606ceb307afa2ca5b',
    'UNI': '0x78d185a741d07edb3aeb9547aa6e684ec6a78531e2aa267e7a52f3c4a14d0b57',
    'LTC': '0x6e3f3fa8253588df9326580180233eb791e03b443a3ba7a1d892e73874e19a54',
    'BCH': '0x3dd2b63686a450ec7077a143b0cc7050e5b4e8ad0b34e7f5d5e1b97c7d4b8c5e',
    'XRP': '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8',
    'ATOM': '0xb00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819',
    'APT': '0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5',
    'NEAR': '0xc415de8d2eba7db216527dff4b60e8f3a5311c740dadb233e13e12547e226750',
    'FTT': '0x8a12be339b0cd1829b91adc01977caa5bf8ad40e5d94d27fed8c8d53c58c0c7',
    '0G': '0xfa9e8d4591613476ad0961732475dc08969d248faca270cc6c47efe009ea3070'
};

// Fetch price from Hermes API using Stable Price Feed ID
async function fetchPriceFromHermes(priceId: string): Promise<PriceData | null> {
    try {
        const response = await fetch(
            `${HERMES_URL}/api/latest_price_feeds?ids[]=${priceId}&verbose=false&binary=false`
        );

        if (!response.ok) {
            throw new Error(`Hermes API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data) || data.length === 0) {
            return null;
        }

        const priceData = data[0];
        const price = priceData.price;

        if (!price || !price.price) {
            return null;
        }

        // Convert price using the exponent
        const normalizedPrice = parseFloat(price.price) * Math.pow(10, price.expo);
        const normalizedConf = parseFloat(price.conf) * Math.pow(10, price.expo);

        return {
            symbol: priceData.id,
            price: normalizedPrice,
            conf: normalizedConf,
            expo: price.expo,
            publishTime: parseInt(price.publish_time),
            priceId: priceData.id
        };
    } catch (error) {
        console.error('Error fetching from Hermes:', error);
        return null;
    }
}

// Fetch multiple prices in batch
async function fetchMultiplePricesFromHermes(priceIds: string[]): Promise<Record<string, PriceData>> {
    try {
        const idsParam = priceIds.map(id => `ids[]=${id}`).join('&');
        const response = await fetch(
            `${HERMES_URL}/api/latest_price_feeds?${idsParam}&verbose=false&binary=false`
        );

        if (!response.ok) {
            throw new Error(`Hermes API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const result: Record<string, PriceData> = {};

        if (!Array.isArray(data)) {
            return result;
        }

        data.forEach((item: any) => {
            const price = item.price;
            if (price && price.price) {
                const normalizedPrice = parseFloat(price.price) * Math.pow(10, price.expo);
                const normalizedConf = parseFloat(price.conf) * Math.pow(10, price.expo);

                result[item.id] = {
                    symbol: item.id,
                    price: normalizedPrice,
                    conf: normalizedConf,
                    expo: price.expo,
                    publishTime: parseInt(price.publish_time),
                    priceId: item.id
                };
            }
        });

        return result;
    } catch (error) {
        console.error('Error fetching multiple prices from Hermes:', error);
        return {};
    }
}

/**
 * Get USD price for a token using Stable Price Feed ID directly
 * @param priceId - Pyth Stable Price Feed ID (e.g., '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43')
 * @returns Promise<PriceResult>
 */
export async function getTokenPriceById(priceId: string): Promise<PriceResult> {
    const result: PriceResult = {
        success: false,
        timestamp: Date.now()
    };

    try {
        if (!priceId || typeof priceId !== 'string') {
            result.error = 'Invalid price feed ID provided';
            return result;
        }

        const priceData = await fetchPriceFromHermes(priceId);

        if (!priceData) {
            result.error = `Failed to fetch price data for price ID: ${priceId}`;
            return result;
        }

        result.success = true;
        result.data = priceData;

        return result;
    } catch (error) {
        console.error('Error getting token price by ID:', error);
        result.error = error instanceof Error ? error.message : 'Unknown error occurred';
        return result;
    }
}

/**
 * Get USD prices for multiple tokens using Stable Price Feed IDs
 * @param priceIds - Array of Pyth Stable Price Feed IDs
 * @returns Promise<MultiplePriceResult>
 */
export async function getMultipleTokenPricesById(priceIds: string[]): Promise<MultiplePriceResult> {
    const result: MultiplePriceResult = {
        success: false,
        timestamp: Date.now()
    };

    try {
        if (!Array.isArray(priceIds) || priceIds.length === 0) {
            result.error = 'Invalid or empty price IDs array provided';
            return result;
        }

        const validPriceIds = priceIds.filter(id => id && typeof id === 'string');

        if (validPriceIds.length === 0) {
            result.error = 'No valid price IDs found in the array';
            return result;
        }

        const pricesData = await fetchMultiplePricesFromHermes(validPriceIds);

        if (Object.keys(pricesData).length === 0) {
            result.error = 'No price data returned for the provided price IDs';
            return result;
        }

        result.success = true;
        result.data = pricesData;

        return result;
    } catch (error) {
        console.error('Error getting multiple token prices by ID:', error);
        result.error = error instanceof Error ? error.message : 'Unknown error occurred';
        return result;
    }
}

/**
 * Get USD price for a token by symbol (using predefined Stable Price Feed IDs)
 * @param symbol - Token symbol (e.g., 'BTC', 'ETH', 'SOL')
 * @returns Promise<PriceResult>
 */
export async function getTokenPrice(symbol: string): Promise<PriceResult> {
    const upperSymbol = symbol.toUpperCase();

    const result: PriceResult = {
        success: false,
        timestamp: Date.now()
    };

    try {
        const priceId = STABLE_PRICE_FEED_IDS[upperSymbol];

        if (!priceId) {
            result.error = `Price feed not found for symbol: ${upperSymbol}. Available symbols: ${Object.keys(STABLE_PRICE_FEED_IDS).join(', ')}`;
            return result;
        }

        const priceResult = await getTokenPriceById(priceId);

        if (!priceResult.success) {
            result.error = priceResult.error;
            return result;
        }

        result.success = true;
        result.data = {
            ...priceResult.data!,
            symbol: upperSymbol
        };

        return result;
    } catch (error) {
        console.error('Error getting token price:', error);
        result.error = error instanceof Error ? error.message : 'Unknown error occurred';
        return result;
    }
}

/**
 * Get USD prices for multiple tokens by symbols
 * @param symbols - Array of token symbols or single symbol string
 * @returns Promise<MultiplePriceResult>
 */
export async function getMultipleTokenPrices(symbols?: string[] | string): Promise<MultiplePriceResult> {
    const result: MultiplePriceResult = {
        success: false,
        timestamp: Date.now()
    };

    try {
        let requestedSymbols: string[] = [];

        if (typeof symbols === 'string') {
            requestedSymbols = symbols.split(',').map(s => s.trim().toUpperCase());
        } else if (Array.isArray(symbols)) {
            requestedSymbols = symbols.map(s => s.trim().toUpperCase());
        } else {
            // If no symbols specified, return all available
            requestedSymbols = Object.keys(STABLE_PRICE_FEED_IDS);
        }

        const priceIds: string[] = [];
        const symbolToPriceId: Record<string, string> = {};

        requestedSymbols.forEach(symbol => {
            const priceId = STABLE_PRICE_FEED_IDS[symbol];
            if (priceId) {
                priceIds.push(priceId);
                symbolToPriceId[priceId] = symbol;
            }
        });

        if (priceIds.length === 0) {
            result.error = `No valid symbols found. Available: ${Object.keys(STABLE_PRICE_FEED_IDS).join(', ')}`;
            return result;
        }

        const pricesResult = await getMultipleTokenPricesById(priceIds);

        if (!pricesResult.success) {
            result.error = pricesResult.error;
            return result;
        }

        const finalResult: Record<string, PriceData> = {};
        Object.entries(pricesResult.data!).forEach(([priceId, data]) => {
            const symbol = symbolToPriceId[priceId];
            if (symbol) {
                finalResult[symbol] = {
                    ...data,
                    symbol
                };
            }
        });

        result.success = true;
        result.data = finalResult;

        return result;
    } catch (error) {
        console.error('Error getting multiple token prices:', error);
        result.error = error instanceof Error ? error.message : 'Unknown error occurred';
        return result;
    }
}

/**
 * Get list of available token symbols
 * @returns Array of available token symbols
 */
export function getAvailableSymbols(): string[] {
    return Object.keys(STABLE_PRICE_FEED_IDS);
}

/**
 * Get Stable Price Feed ID for a token symbol
 * @param symbol - Token symbol
 * @returns Stable Price Feed ID or null if not found
 */
export function getPriceFeedId(symbol: string): string | null {
    return STABLE_PRICE_FEED_IDS[symbol.toUpperCase()] || null;
}

/**
 * Add a new Stable Price Feed ID for a token symbol
 * @param symbol - Token symbol
 * @param priceId - Pyth Stable Price Feed ID
 */
export function addPriceFeed(symbol: string, priceId: string): void {
    STABLE_PRICE_FEED_IDS[symbol.toUpperCase()] = priceId;
}

/**
 * Simple wrapper to get just the price number (throws on error)
 * @param symbol - Token symbol
 * @returns Promise<number> - USD price
 */
export async function getPrice(symbol: string): Promise<number> {
    const result = await getTokenPrice(symbol);
    if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get price');
    }
    return result.data.price;
}

/**
 * Simple wrapper to get price by Stable Price Feed ID (throws on error)
 * @param priceId - Stable Price Feed ID
 * @returns Promise<number> - USD price
 */
export async function getPriceById(priceId: string): Promise<number> {
    const result = await getTokenPriceById(priceId);
    if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get price');
    }
    return result.data.price;
}

/**
 * Get multiple prices as a simple object (throws on error)
 * @param symbols - Array of symbols or single symbol
 * @returns Promise<Record<string, number>> - Symbol to USD price mapping
 */
export async function getPrices(symbols?: string[] | string): Promise<Record<string, number>> {
    const result = await getMultipleTokenPrices(symbols);
    if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get prices');
    }

    const prices: Record<string, number> = {};
    Object.entries(result.data).forEach(([symbol, data]) => {
        prices[symbol] = data.price;
    });

    return prices;
}

export const get0gPrice = async (): Promise<PriceResult> => {
    return await getTokenPrice('0G');
}

// Default export for convenience
export default {
    getTokenPrice,
    getTokenPriceById,
    getMultipleTokenPrices,
    getMultipleTokenPricesById,
    getAvailableSymbols,
    getPriceFeedId,
    addPriceFeed,
    getPrice,
    getPriceById,
    getPrices
};

