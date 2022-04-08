import {getConnection} from 'typeorm'
import {AmqpTestService, MessageHandler} from '@globalid/nest-amqp'
import {JwtService} from '@nestjs/jwt'
import {mockTokenData, TokenData} from '@globalid/nest-auth'

export async function truncateEntity(entity: { name: string }): Promise<void> {
    const databaseConnection = getConnection();
    const repository = databaseConnection.getRepository(entity.name);
    const metadata = repository.metadata;
    await databaseConnection.getRepository(metadata.name).query(`TRUNCATE public.${metadata.tableName} RESTART IDENTITY CASCADE;`);
}

export async function spyMessage(amqpService: AmqpTestService, message: object): Promise<{ spy: jest.Mock; unsubscribe: () => Promise<void> }> {
    const spy = jest.fn();
    const unsubscribe: () => Promise<void> = await amqpService.subscribe(message, spy);

    return {spy, unsubscribe}
}

export function mockAuthPayload(jwtService: JwtService, tokenDataOverwrite?: Partial<TokenData>): string {
    const tokenData: TokenData = mockTokenData(tokenDataOverwrite);

    return `Bearer ${jwtService.sign(JSON.stringify(tokenData))}`
}

export function gbacToClaims(permissions: string[]): Record<string, 'yes'> {
    return permissions.reduce((claims: Record<string, 'yes'>, p: string): Record<string, 'yes'> => ({
        ...claims,
        [`gbac.${p}`]: 'yes'
    }), {})
}
