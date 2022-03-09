import axios, {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios'
import {NoAccessTokenError} from '../error/authorization'
import {isEmpty} from '../util/validation'
import {API_URL, ChannelsResponse, Config, IS_DEBUG} from '../model'
import {Injectable} from "@nestjs/common";
import {KeystoreDto} from "../dto/keystore.model";
import {IssueNewKeyPairResponse} from "../response/keystore.response";

@Injectable()
export class KeystoreService {

    private static AUTHORIZATION_HEADER: string = 'Authorization'
    private static TOKEN_HEADER: string = 'x-token-data'

    private accessToken : string
    private readonly client: AxiosInstance

    constructor() {
        this.client = this.createHttpClient()
    }

    // tslint:disable-next-line:no-any
    private getResponseData<T = any>(response: AxiosResponse<T>): T {
        return response.data
    }

    private createHttpClient(): AxiosInstance {
        const config: AxiosRequestConfig = {
            baseURL: API_URL
        }

        const instance: AxiosInstance = axios.create(config)
        instance.interceptors.request.use(this.createInterceptor(), this.createErrorHandler)

        return instance
    }

    // istanbul ignore next
    // Is not executed with mocked axios instance
    private createInterceptor(): (value: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig> {
        return (request: AxiosRequestConfig): Promise<AxiosRequestConfig> | AxiosRequestConfig => {
            if (IS_DEBUG && this.accessToken === '') {
                // tslint:disable-next-line:no-unsafe-any
                request.headers[KeystoreService.TOKEN_HEADER] = JSON.stringify({
                    globalid: process.env.TEST_USER_GLOBALID,
                    uuid: process.env.TEST_USER_UUID,
                    client_id: '72eed7a4-a949-4305-bf1b-4d695bdfa817',
                    grant_type: 'refresh_token',
                    rnd: 'test'
                })

                return request
            }

            if (isEmpty(this.accessToken)) {
                return Promise.reject(new NoAccessTokenError())
            }

            // tslint:disable-next-line:no-unsafe-any
            request.headers[KeystoreService.AUTHORIZATION_HEADER] = `${this.accessToken}`
            return request
        }
    }

    // istanbul ignore next
    private createErrorHandler(): Function {
        return (error: AxiosError): void => {
            // tslint:disable-next-line:no-console
            console.error(error)
            throw error
        }
    }

    public async getKeystore(page: number = 1, perPage: number = 20): Promise<IssueNewKeyPairResponse> {
        return this.getResponseData(await this.client.get<IssueNewKeyPairResponse>('/identity', {
            params: {
                page: page,
                per_page: perPage,
            }
        }))
    }

    public async createKeystore(token: string, gid_uuid: string, body: KeystoreDto): Promise<IssueNewKeyPairResponse> {
        this.accessToken = token;
        return this.getResponseData(await this.client.post<IssueNewKeyPairResponse>(
            '/identity/' + gid_uuid + '/keys',
            body))
    }

}
