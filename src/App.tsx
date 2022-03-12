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
import { injected, getBondTokenFactoryContract,
  getBondMakerContract } from "./utility/web3util"
import { simpleRpcProvider } from './utility/providers'
import "./App.css";
import { setConstantValue } from "typescript";

const bondDetail = ["Coupon 3.5% Maturity June 2025 ",
"Coupon 4.5% Maturity January 2035",
"Coupon 2.5% Maturity June 2030"];

function App() {
  const { active, account, library, activate, deactivate } = useWeb3React<Web3Provider>()

	const [address, setAddress] = useState<string>("");
	const [investAmountToAdd, setInvestAmountToAdd] = useState<string>("");
	const [showOverlay, setShowOverlay] = useState<boolean>(false);
	const [bondItems, setBondItems] = useState<{ key: number; value: string }[]>([]);
  const [selectedBondIndex, setSelectedBondIndex] = useState<number>(0);
  const [selectedBondItem, setSelectedBondItem] = useState<{ key: number; value: string }[]>([]);
  const [bondTokenInfo, setBondTokenInfo] = useState<string>("")

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
        console.log(keyIndex)
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
    } else {
      console.log("library.signer")
      contractBTFactory = getBondTokenFactoryContract(library.getSigner())
      contractBM = getBondMakerContract(library.getSigner())
    }
	}, []);

	const btnAddOnClick = async () => {
		if (investAmountToAdd) {
      const investNumber = parseInt(investAmountToAdd, 10);
      console.log(investNumber)
      if (!isNaN(investNumber)){
        showLoading(true);
        try {
          console.log('btnAddOnClick');
          alert(`You invest $${investNumber}`)
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

  async function createBondToken() {
    if (!active) {
      alert("Please connect metamask");
    } else {
      try {
        if (contractBM == undefined) {
          if (library) {
            console.log('library is defined')
            contractBM = getBondMakerContract(library.getSigner())
            const newBond = await contractBM.registerNewBond(
              "Test", 
              "Test", 
              1000,
              1,
              2,
              9, //maturity
              0
            );
            console.log(newBond)
            setBondTokenInfo(`Transaction Hash ${newBond.hash}`)
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
										</div>
									</Col>
								</Row>
							</Container>
						</Col>
					</Row>
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
                      Create Bond Token</Button>
                  </Col>
                  <Col>
                    <span>{bondTokenInfo}</span>
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
