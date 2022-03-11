import { ethers } from 'ethers'

const api_key = process.env.REACT_APP_API_KEY
const RPC_URL = `https://eth-rinkeby.alchemyapi.io/v2/${api_key}`

console.log(`api_key ${api_key}`)
export const simpleRpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL)

// alternative way
//export const simpleRpcProvider = ethers.getDefaultProvider("rinkeby", {
//  infura: RPC_URL,
//});

export default null
