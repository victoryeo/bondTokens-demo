import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { Table, Dropdown } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import LoadingOverlay from "react-loading-overlay";
import { BeatLoader } from "react-spinners";
import { useWeb3React } from "@web3-react/core"
import { Web3Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import { TransactionResponse, 
  TransactionReceipt } from "@ethersproject/abstract-provider";
import { injected, getBondTokenFactoryContract,
  getBondMakerContract } from "./utility/web3util"
import { simpleRpcProvider } from './utility/providers'
import "./App.css";

const bondDetail = ["Coupon 3.5% Maturity June 2025 ",
"Coupon 4.5% Maturity January 2035",
"Coupon 2.5% Maturity June 2030"];

function App() {
  const { active, account, library, activate, deactivate } = useWeb3React<Web3Provider>()

	const [walletAddress, setWalletAddress] = useState<string>("");
	const [investAmountToAdd, setInvestAmountToAdd] = useState<string>("");
	const [showOverlay, setShowOverlay] = useState<boolean>(false);
	const [bondItems, setBondItems] = useState<{ key: number; value: string }[]>([]);
  const [selectedBondIndex, setSelectedBondIndex] = useState<number>(0);
  const [selectedBondItem, setSelectedBondItem] = useState<{ key: number; value: string }[]>([]);
  const [bondTokenHashInfo, setBondTokenHashInfo] = useState<string>("")
  const [bondMintingHashInfo, setBondMintingHashInfo] = useState<string>("")
  const [bondInvestmentHashInfo, setBondInvestmentHashInfo] = useState<string>("")
  const [bondID, setBondID] = useState<string>("")
  const [investNumber, setInvestNumber] = useState<number>(0)

	let counter: number = 0;
  let contractBTFactory: ethers.Contract;
  let contractBM: ethers.Contract;

	const showLoading = (shouldShow: boolean) => {
		if (shouldShow) {
			setShowOverlay(true);
			counter++;
		} else {
			if (--counter <= 0) {
				setShowOverlay(false);
				counter = 0;
			}
		}
	};

  const setBondInfo = () => {
    const bondJson = '{ \
      "1":"Company A",  \
      "2":"Company B",  \
      "3":"Company C" \
    }';
    const bondList = JSON.parse(bondJson);
    setBondItems(
      Object.entries(bondList).map(([keyIndex, value]) => {
        //console.log(keyIndex)
        const key = parseInt(keyIndex, 10);
        return {
          key,
          value: String(value || ""),
        };
      })
    );
    console.log(bondItems)
  }

	useEffect(() => {
    setBondInfo();

    if (library == undefined) {
      console.log("library undefined")
      contractBTFactory = getBondTokenFactoryContract(simpleRpcProvider)
      console.log(contractBTFactory)
      contractBM = getBondMakerContract(simpleRpcProvider)
      console.log(contractBM)
      simpleRpcProvider.on('LogRegisterNewBond', (eventResult) => {
        console.log({eventResult})
      })
      simpleRpcProvider.on('block', () => {
        //console.log('update balance...')
      })
      simpleRpcProvider.on('blockNumber', (blockNumber) => {
        console.log({blockNumber})
    })
    } else {
      console.log("library.signer")
      contractBTFactory = getBondTokenFactoryContract(library.getSigner())
      contractBM = getBondMakerContract(library.getSigner())
      library.on('LogRegisterNewBond', (eventResult) => {
        console.log({eventResult})  
      })
      library.on('block', () => {
        //console.log('update balance...')
      })
      library.on('blockNumber', (blockNumber) => {
        console.log({blockNumber})
    })
    }
	}, [library]);

	const btnAddOnClick = async () => {
		if (investAmountToAdd) {
      const investNumber = parseInt(investAmountToAdd, 10);
      console.log(investNumber)
      if (!isNaN(investNumber)){
        showLoading(true);
        try {
          console.log('btnAddOnClick');
          alert(`You invest $${investNumber}`)
          setInvestNumber(investNumber)
          transferBondToken()
          // call web3
        } catch (err) {
          console.log(err);
          alert(err);
        } finally {
          showLoading(false);
        }
      } else {
        alert("Please enter a number");
      }
		} else {
			alert("Please fill in investment amount");
		}
	};

	const onInvestAmountToAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInvestAmountToAdd(e.target.value);
	};

  const onDropdownClick = (e:any) => {
    console.log(e.currentTarget.textContent);

    let selectedIndex: number = e.currentTarget.textContent.replace(/[^0-9]/g,'');

    const selectedBondItem = bondItems.filter((item) => {
      console.log(item.key)
      console.log(selectedIndex)
      return(item.key == selectedIndex )
    })
    setSelectedBondItem(selectedBondItem)
    setSelectedBondIndex(selectedIndex);
  }

  async function transferBondToken() {
    console.log('transferBondToken')
    console.log(account)
    console.log(investNumber)
    if (bondTokenHashInfo == "") {
      alert("Bond token contract is not available.\nPlease deploy bond token contract");
    } else {
      try {
        if (contractBM == undefined) {
          if (library) {
            contractBM = getBondMakerContract(library.getSigner())
            const newTransfer = await contractBM.transferBond(
              bondID,
              account,
              investNumber/1000
            )
            console.log(newTransfer)
            setBondInvestmentHashInfo(`Investment Hash ${newTransfer.hash}`)
            const res: any = await newTransfer.wait();
          }
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

  async function mintBondToken() {
    if (bondTokenHashInfo == "") {
      alert("Please create bond token contract before minting");
    } else {
      try {
        if (contractBM == undefined) {
          if (library) {
            contractBM = getBondMakerContract(library.getSigner())
            const newIssue = await contractBM.issueNewBonds(
              bondID, 
              1000   // number of tokens to be minted
            )
            console.log(newIssue)
            setBondMintingHashInfo(`Transaction Hash ${newIssue.hash}`)
            const res: any = await newIssue.wait();
            console.log(res)
            console.log(res.events[2].topics[2])  //the wallet address
            let test2 = res.events[2].topics[2]
            // remove leading zeros
            test2 = test2.replace(/^(0x)0+((\w{4})+)$/, "$1$2")
            setWalletAddress(test2)
            console.log(res.events[2].data)  //data contains the bond FV
          }
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

  async function createBondToken() {
    if (!active) {
      alert("Please connect MetaMask wallet");
    } else {
      try {
        if (contractBM == undefined) {
          if (library) {
            console.log('library is defined')
            contractBM = getBondMakerContract(library.getSigner())
            const newBond: TransactionResponse = await contractBM.registerNewBond(
              "Test", 
              "Test", 
              1000,   // face value
              1,
              2,
              9, //maturity
              0
            );
            console.log(newBond)
            setBondTokenHashInfo(`Transaction Hash ${newBond.hash}`)
            // what is res type ?
            const res: any = await newBond.wait();
            //second event is the LogRegisterNewBond event
            console.log(res)
            console.log(res.events[2].topics[1])
            setBondID(res.events[2].topics[1])
            // after wait, get Transaction receipt
            const tReceipt: TransactionReceipt = await library.getTransactionReceipt(newBond.hash)
            console.log(tReceipt)
          }
        }  
      } catch (err) {
        console.log(err)
      }
    }
  }

  async function connect() {
    try {
      await activate(injected)
    } catch (err) {
      console.log(err)
    }
  }

  async function disconnect() {
    try {
      deactivate()
    } catch (err) {
      console.log(err)
    }
  }

	return (
		<LoadingOverlay active={showOverlay} spinner={<BeatLoader color="#FFFFFF" />}>
			<div className="App">
				<Container>
					<Row>
						<Col>
							<Container className="section">
								<Row>
									<Col>
										<h3>Bond</h3>
									</Col>
								</Row>
								<Row>
                <Dropdown>
                  <Dropdown.Toggle variant="success" id="dropdown-basic">
                    Bond List
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item href="#/action-1" onClick={onDropdownClick}>Bond 1</Dropdown.Item>
                    <Dropdown.Item href="#/action-2" onClick={onDropdownClick}>Bond 2</Dropdown.Item>
                    <Dropdown.Item href="#/action-3" onClick={onDropdownClick}>Bond 3</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
								</Row>
							</Container>
						</Col>
						<Col>
							<Container className="section">
								<Row>
									<Col>
										<h3>Bond Information</h3>
									</Col>
								</Row>
                <Row>
                  <Table>
                    <tbody>
                      {selectedBondItem.map((item, i) => {
													return (
														<tr key={i}>
															<td>{item.key}</td>
															<td>{item.value}</td>
														</tr>
													);
											})}
                      <tr><td></td>
                      <td>
                        {bondDetail[selectedBondIndex-1]}
                      </td></tr>
                    </tbody>
                  </Table>
                </Row>
							</Container>
						</Col>
					</Row>
					<Row>
						<Col>
							<Container className="section">
								<Row>
									<Col>
										<h3>Actions</h3>
									</Col>
								</Row>
								<Row>
									<Col>
										<div className="section">
											<div>Investment Amount</div>
											<div>
												<Form.Control type="string" placeholder="Investment Amount" onChange={onInvestAmountToAddChange} />
											</div>
											<div>
												<Button variant="success" onClick={btnAddOnClick}>
													Submit
												</Button>
											</div>
										</div>
									</Col>
									<Col>
										<div className="section">
											<div>Minimum amount of $1000</div>
                      <div>Enter numeric value only</div>
                      <div>{bondInvestmentHashInfo}</div>
										</div>
									</Col>
								</Row>
							</Container>
						</Col>
					</Row>
          <hr></hr>
          <Row>
            <Col>
              <Container className="section">
                <Row>
                  <Col>
                      <div className="section">
                        <Button onClick={connect} className="bg-blue-600 ">Connect to MetaMask</Button>
                      </div>
                      <div className="section">
                        {active ? 
                        <span>Connected with <b>{account}</b></span>
                         : <span>Not connected</span>}
                      </div>
                  </Col>
                  <Col>
                      <div className="section">
                        <Button onClick={disconnect} className="bg-blue-600 ">Disconnect
                        </Button>
                      </div>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Button onClick={createBondToken} className="bg-white-600 ">
                      Create Bond Token Contract</Button>
                  </Col>
                  <Col>
                    <span>{bondTokenHashInfo}</span>
                  </Col>
                </Row>
                <Row>
                  <Col></Col>
                  <Col>
                    <div>Bond Token ID</div>
                    <span>{bondID}</span>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Button onClick={mintBondToken} className="bg-white-600 ">
                      Mint Bond Token</Button>
                  </Col>
                  <Col>
                    <span>{bondMintingHashInfo}</span>
                  </Col>
                </Row>
                <Row>
                  <Col></Col>
                  <Col>
                    <div>Wallet address</div>
                    <span>{walletAddress}</span>
                  </Col>
                </Row>
              </Container>
            </Col>
          </Row>
        </Container>
			</div>
		</LoadingOverlay>
	);
}

export default App;
