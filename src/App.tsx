import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { Table, Dropdown } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import LoadingOverlay from "react-loading-overlay";
import { BeatLoader } from "react-spinners";
import { useWeb3React } from "@web3-react/core"
import { injected } from "./utility/web3util"
import "./App.css";

const bondDetail = ["Coupon 3.5% Maturity June 2025 ",
"Coupon 4.5% Maturity January 2035",
"Coupon 2.5% Maturity June 2030"];

function App() {
  const { active, account, activate, deactivate } = useWeb3React()

	const [address, setAddress] = useState<string>("");
	const [investAmountToAdd, setInvestAmountToAdd] = useState<string>("");
	const [showOverlay, setShowOverlay] = useState<boolean>(false);
	const [bondItems, setBondItems] = useState<{ key: number; value: string }[]>([]);
  const [selectedBondIndex, setSelectedBondIndex] = useState<number>(0);
  const [selectedBondItem, setSelectedBondItem] = useState<{ key: number; value: string }[]>([]);

	let counter: number = 0;

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

  async function connect() {
    try {
      await activate(injected)
    } catch (ex) {
      console.log(ex)
    }
  }

  async function disconnect() {
    try {
      deactivate()
    } catch (ex) {
      console.log(ex)
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
            <Container>
              <Col>
                <Container className="section">
                  <div className="section">
                    <Button onClick={connect} className="bg-blue-600 ">Connect to MetaMask</Button>
                    {active ? <span>Connected with <b>{account}</b></span> : <span>Not connected</span>}
                  </div>
                </Container>
              </Col>
              <Col>
                <Container className="section">
                  <div className="section">
                    <Button onClick={disconnect} className="bg-blue-600 ">Disconnect
                    </Button>
                  </div>
                </Container>
              </Col>
            </Container>
          </Row>
        </Container>
			</div>
		</LoadingOverlay>
	);
}

export default App;
