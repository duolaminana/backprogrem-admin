import HttpRequest from '@/libs/axios'
import config from '@/config'

const baseUrl = process.env.NODE_ENV === 'dev' ? config.baseUrl.dev : process.env.NODE_ENV === 'test' ? config.baseUrl.test : config.baseUrl.master
const axios = new HttpRequest(baseUrl)
export default axios
