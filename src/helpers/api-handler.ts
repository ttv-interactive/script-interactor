import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import FileHandler from './file-handler'
import { Logger } from '../utils'

export default class ApiHandler {

    private static request = this.createRequest()

    // Create the AxiosRequest object 
    private static createRequest() : AxiosInstance {

        const handleSuccess = (response : AxiosResponse) => {
            return response
        }

        const handleError = (error : AxiosError) => {

            if (error.response) {
                // If status is 401, it means the token isn't valid
                // Dont print the API ERROR since validateToken() will handle it
                if (error.response.status !== 401) {
                    Logger.log(`API ERROR: ${error.config.url} ${error}\n`, Logger.StatusTypes.Failure)
                }
            }

            return Promise.reject(error)
        }

        const request = axios.create()
        // Set the client ID as common header
        request.defaults.headers.common['Client-Id'] = '0d6gr675zeng3fff9g0twaump6dv1o'
        request.interceptors.response.use(handleSuccess, handleError)
        
        return request
    }

    // Validate the Bearer token for the Twitch API
    private static async validateToken() : Promise<void>{
        await this.request.get('https://id.twitch.tv/oauth2/validate')
        .then( 
            () => {
                Logger.log('API bearer token passed validation', Logger.StatusTypes.Success)
                Promise.resolve()
            }
        )
        .catch(
            async () => {
                // Create a new token
                await this.request.get(`https://api.script-interactor.com/token`).then( 
                    ( response : AxiosResponse ) => {
                        // Get the token and update it in the header
                        this.request.defaults.headers.common['Authorization'] =  `Bearer ${response.data['access_token']}`
                        Logger.log(`API bearer new token created`, Logger.StatusTypes.Success)
                        Promise.resolve()
                    }
                ).catch(
                    ( error : AxiosError ) => {
                        Logger.log(`API bearer token did not create. ${error}`, Logger.StatusTypes.Failure)
                    }
                )
            }
        )
    }

    // Validate the token and process the GET request
    static async get(endpoint : string, config = {}) : Promise<AxiosResponse>{
        // Check the token if it is valid first
        return new Promise<AxiosResponse>((resolve, reject) => {
            this.validateToken().then(() => {
                const url = 'https://api.twitch.tv/helix/' + endpoint
    
                // Call the endpoint and execute the callback if successfull
                this.request.get(url, config).then(
                    response => resolve(response)
    
                ).catch( (error : AxiosError) => {
                    reject(error)
                })
    
            }).catch( error => {
                Logger.log(`API ERROR: GET request with invalid bearer token\n${error}`, Logger.StatusTypes.Failure)
            })
        })
    }
    
    // Check if a userid is a follower to the broadcaster channel
    static async isFollowing(userId : string) {

        // Get the channel name
        const channel = FileHandler.settings.client.channel

        let isFollowing = false

        await this.get(`users/follows`, { params: { 'from_id' :userId }}).then((response) => {
            // Go through all of their following and match for the channel
            for (let followerData of response.data['data']) {
                const toChannel = followerData['to_name']
                
                if (toChannel == channel) {
                    isFollowing = true
                }
            }
        }).catch(error => {
            isFollowing = null
        })
        return isFollowing
    }
}