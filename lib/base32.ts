const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export const base32ToBytes = (input: string): Uint8Array => {
    const sanitized = input.replace(/=+$/, '').toUpperCase()
    if (!sanitized) {
        throw new Error('Base32 string is empty')
    }

    let bits = ''
    for (const char of sanitized) {
        const index = BASE32_ALPHABET.indexOf(char)
        if (index === -1) {
            throw new Error('Invalid Base32 character')
        }
        bits += index.toString(2).padStart(5, '0')
    }

    const bytes: number[] = []
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.slice(i, i + 8), 2))
    }

    return new Uint8Array(bytes)
}
