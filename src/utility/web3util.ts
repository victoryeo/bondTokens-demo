import { InjectedConnector } from '@web3-react/injected-connector'
import Web3 from 'web3'
import BondTokenFactoryAbi from 'config/abi/BondTokenFactory.json'

const api_key = process.env.REACT_APP_API_KEY
const rinkeby = `https://eth-rinkeby.alchemyapi.io/v2/${api_key}`

export const injected = new InjectedConnector({
  supportedChainIds: [4],
})

export function getLibrary(provider:any) {
  console.log("getLibrary")
  console.log(provider)
  return new Web3(provider)
}

export const getAddress = (address: string): string => {
  const chainId = 4
  return address[chainId]
}

const getContract = (abi: any, address: string) => {
  const web3 = new Web3(new Web3.providers.HttpProvider(rinkeby));
  const contract = new web3.eth.Contract(abi, address)
  return contract
}

export const getBondTokenFactoryContract = (address: string) => {
  return getContract(BondTokenFactoryAbi, address)
}
