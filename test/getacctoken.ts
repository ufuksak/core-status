const dotenv = require('dotenv')
dotenv.config()
const atlasRouteTesting = require('micro-kit-atlas/dist/testing/routing')

export function getAccessToken(): string {
    return atlasRouteTesting.mockTokenDataHeader({
        iss: process.env.JWT_ISSUER,
        scope: 'public keys.manage',
    }, process.env.JWT_PUBLIC_KEY).authorization.split(' ').pop()
}
