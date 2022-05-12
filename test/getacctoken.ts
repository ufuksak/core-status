const dotenv = require('dotenv')
dotenv.config()
const atlasRouteTesting = require('micro-kit-atlas/dist/testing/routing')

export function getAccessToken(scope?: string, uuid?: string): string {
    const shift = new Date();
    shift.setDate(shift.getDate() + 1);
    const exp = Math.floor(shift.getTime() / 1000);

    return atlasRouteTesting.mockTokenDataHeader({
        uuid,
        iss: process.env.JWT_ISSUER,
        exp,
        scope: scope || 'public',
    }, process.env.JWT_PUBLIC_KEY).authorization.split(' ').pop()
}
