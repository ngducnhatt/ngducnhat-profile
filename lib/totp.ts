import { base32ToBytes } from './base32'

export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512' | string

export interface TotpOptions {
    digits?: number
    period?: number
    algorithm?: HashAlgorithm
    timestamp?: number
    epoch?: number
}

export interface VerifyOptions extends TotpOptions {
    window?: number
}

export interface TotpEntry {
    id: string
    issuer: string
    label: string
    secret: string
    digits: number
    period: number
    algorithm: HashAlgorithm
    epoch?: number
}

export interface BatchOptions {
    timestamp?: number
    sort?: boolean
    comparator?: (a: TotpEntry, b: TotpEntry) => number
}

export interface GeneratedToken {
    id: string
    issuer: string
    label: string
    code: string
    expiresIn: number
    digits: number
}

export interface TimeWindow {
    counter: number
    secondsIntoWindow: number
    expiresIn: number
    period: number
}

interface NormalizedTotpOptions {
    digits: number
    period: number
    algorithm: HashAlgorithm
    timestamp: number
    epoch: number
}

const DEFAULT_OPTIONS: NormalizedTotpOptions = {
    digits: 6,
    period: 30,
    algorithm: 'SHA-1',
    timestamp: Date.now(),
    epoch: 0,
}

const SECRET_CACHE_LIMIT = 256
const KEY_CACHE_LIMIT = 256
const secretByteCache = new Map<string, Uint8Array>()
const hmacKeyCache = new Map<string, Promise<CryptoKey>>()

const getCrypto = (): SubtleCrypto => {
    if (globalThis.crypto?.subtle) {
        return globalThis.crypto.subtle
    }
    throw new Error('Web Crypto API is not available in this environment.')
}

const normalizeOptions = (options: TotpOptions = {}): NormalizedTotpOptions => ({
    digits: Number(options.digits ?? DEFAULT_OPTIONS.digits) || DEFAULT_OPTIONS.digits,
    period: Number(options.period ?? DEFAULT_OPTIONS.period) || DEFAULT_OPTIONS.period,
    algorithm: (options.algorithm || DEFAULT_OPTIONS.algorithm).toUpperCase(),
    timestamp: options.timestamp ?? Date.now(),
    epoch: options.epoch ?? 0,
})

export const normalizeSecretInput = (secret: string): string => {
    if (!secret) {
        throw new Error('Secret is required')
    }
    return secret.toUpperCase().replace(/[^A-Z2-7]/g, '')
}

const trimCache = <T>(map: Map<string, T>, limit: number): void => {
    while (map.size > limit) {
        const iterator = map.keys().next()
        if (iterator.value === undefined) break
        map.delete(iterator.value)
    }
}

const getCachedSecretBytes = (secret: string): Uint8Array => {
    const cached = secretByteCache.get(secret)
    if (cached) return cached
    const bytes = base32ToBytes(secret)
    secretByteCache.set(secret, bytes)
    trimCache(secretByteCache, SECRET_CACHE_LIMIT)
    return bytes
}

const resolveHashAlgorithm = (algorithm: HashAlgorithm = 'SHA-1'): HashAlgorithm => {
    const upper = (algorithm || 'SHA-1').toUpperCase()
    return upper.startsWith('SHA-') ? upper : (`SHA-${upper}` as HashAlgorithm)
}

const getCachedHmacKey = async (
    secretBytes: Uint8Array,
    secretKey: string,
    algorithm: HashAlgorithm,
): Promise<CryptoKey> => {
    const hash = resolveHashAlgorithm(algorithm)
    const cacheKey = `${hash}:${secretKey}`
    const cached = hmacKeyCache.get(cacheKey)
    if (cached) return cached
    const subtle = getCrypto()
    const keyPromise = subtle.importKey('raw', secretBytes as BufferSource, { name: 'HMAC', hash }, false, ['sign'])
    hmacKeyCache.set(cacheKey, keyPromise)
    trimCache(hmacKeyCache, KEY_CACHE_LIMIT)
    try {
        const key = await keyPromise
        return key
    } catch (error) {
        hmacKeyCache.delete(cacheKey)
        throw error
    }
}

const counterToBuffer = (counter: number): ArrayBuffer => {
    const buffer = new ArrayBuffer(8)
    const view = new DataView(buffer)
    const bigCounter = BigInt(counter)
    view.setBigUint64(0, bigCounter)
    return buffer
}

const hmacDigest = async (
    secretBytes: Uint8Array,
    normalizedSecret: string,
    counterBuffer: ArrayBuffer,
    algorithm: HashAlgorithm,
): Promise<Uint8Array> => {
    const cryptoSubtle = getCrypto()
    const key = await getCachedHmacKey(secretBytes, normalizedSecret, algorithm)
    const result = await cryptoSubtle.sign('HMAC', key, counterBuffer as BufferSource)
    return new Uint8Array(result)
}

const truncate = (hmacArray: Uint8Array): number => {
    const offset = hmacArray[hmacArray.length - 1] & 0x0f
    const binary =
        ((hmacArray[offset] & 0x7f) << 24) |
        ((hmacArray[offset + 1] & 0xff) << 16) |
        ((hmacArray[offset + 2] & 0xff) << 8) |
        (hmacArray[offset + 3] & 0xff)
    return binary
}

export const getTimeWindow = (period = 30, timestamp = Date.now(), epoch = 0): TimeWindow => {
    const elapsed = Math.floor((timestamp - epoch) / 1000)
    const counter = Math.floor(elapsed / period)
    const secondsIntoWindow = elapsed - counter * period
    return {
        counter,
        secondsIntoWindow,
        expiresIn: period - secondsIntoWindow,
        period,
    }
}

export const generateTOTP = async (secret: string, options: TotpOptions = {}): Promise<string> => {
    const normalizedSecret = normalizeSecretInput(secret)
    const opts = normalizeOptions(options)
    const secretBytes = getCachedSecretBytes(normalizedSecret)
    const { counter } = getTimeWindow(opts.period, opts.timestamp, opts.epoch)
    const counterBuffer = counterToBuffer(counter)
    const hmacArray = await hmacDigest(secretBytes, normalizedSecret, counterBuffer, opts.algorithm)
    const binary = truncate(hmacArray)
    const code = binary % 10 ** opts.digits
    return code.toString().padStart(opts.digits, '0')
}

export const verifyTOTP = async (secret: string, token: string, options: VerifyOptions = {}): Promise<boolean> => {
    const { window = 1, ...rest } = options
    const digits = rest.digits ?? DEFAULT_OPTIONS.digits
    const normalizedToken = (token || '').trim()
    if (normalizedToken.length !== digits) {
        return false
    }
    for (let errorWindow = -window; errorWindow <= window; errorWindow += 1) {
        const timestamp = rest.timestamp ?? Date.now()
        const adjustedTimestamp = timestamp + errorWindow * (rest.period ?? DEFAULT_OPTIONS.period) * 1000
        const code = await generateTOTP(secret, { ...rest, timestamp: adjustedTimestamp })
        if (timingSafeEqual(code, normalizedToken)) {
            return true
        }
    }
    return false
}

const defaultBatchComparator = (a: TotpEntry, b: TotpEntry): number =>
    a.issuer.localeCompare(b.issuer) || a.label.localeCompare(b.label)

export const generateBatch = async (entries: TotpEntry[] = [], options: BatchOptions = {}): Promise<GeneratedToken[]> => {
    const timestamp = options.timestamp ?? Date.now()
    const shouldSort = options.sort ?? true
    const comparator = options.comparator || defaultBatchComparator
    const workingSet = shouldSort ? [...entries].sort(comparator) : entries
    const results = await Promise.all(
        workingSet.map(async (entry) => {
            const code = await generateTOTP(entry.secret, {
                digits: entry.digits,
                period: entry.period,
                algorithm: entry.algorithm,
                timestamp,
            })
            const { expiresIn } = getTimeWindow(entry.period, timestamp, entry.epoch ?? 0)
            return {
                id: entry.id,
                issuer: entry.issuer,
                label: entry.label,
                code,
                expiresIn,
                digits: entry.digits,
            } satisfies GeneratedToken
        }),
    )
    return results
}

const timingSafeEqual = (a: string, b: string): boolean => {
    if (a.length !== b.length) return false
    let result = 0
    for (let i = 0; i < a.length; i += 1) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }
    return result === 0
}

export const TotpDefaults: NormalizedTotpOptions = { ...DEFAULT_OPTIONS }
