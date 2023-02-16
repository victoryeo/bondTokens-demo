import { InjectedConnector } from '@web3-react/injected-connector'
import { ethers } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import BondTokenFactoryAbi from '../config/abi/BondTokenFactory.json'
import BondMakerAbi from '../config/abi/BondMaker.json'
import Web3 from 'web3'
import contracts from '../config/constants/contracts'

const api_key = process.env.REACT_APP_API_KEY
const goerli = `https://eth-goerli.g.alchemyapi.io/v2/${api_key}`
const GOERLI = 5

export const injected = new InjectedConnector({
  supportedChainIds: [GOERLI],   //rinkeby
})

export function getLibrary(provider:any): Web3Provider {
  console.log("getLibrary")
  console.log(provider)
  //const library = new Web3(provider)
  //return library

  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

const getContract = (abi: any, address: string, signer: ethers.Signer|ethers.providers.Provider) => {
  //const web3 = new Web3(new Web3.providers.HttpProvider(rinkeby));
  //const contract = new web3.eth.Contract(abi, address)
  const contract = new ethers.Contract(address, abi, signer)
  return contract
}

export const getBondTokenFactoryContract = (signer: ethers.Signer|ethers.providers.Provider) => {
  console.log("getBondTokenFactoryContract")
  console.log(signer)
  return getContract(BondTokenFactoryAbi, contracts.bondTokenFactory[GOERLI], signer)
}

export const getBondMakerContract = (signer: ethers.Signer|ethers.providers.Provider) : ethers.Contract => {
  console.log("getBondMakerContract")
  console.log(signer)
  return getContract(BondMakerAbi, contracts.bondMaker[GOERLI], signer)
}