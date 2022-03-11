import { InjectedConnector } from '@web3-react/injected-connector'
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'

export const injected = new InjectedConnector({
  supportedChainIds: [3, 4, 5, 42],
})

export function getLibrary(provider) {
  return new Web3(provider)
}