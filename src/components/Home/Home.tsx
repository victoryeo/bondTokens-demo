import React, { useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Admin from '../Admin/Admin';
import Investor from '../Investor/Investor';

function Home() {
  const [key, setKey] = useState('admin');

  return (
    <Tabs
      defaultActiveKey="admin"
    >
      <Tab eventKey="admin" title="Admin">
        <Admin />
      </Tab>
      <Tab eventKey="investor" title="Investor">
        <Investor />
      </Tab>
    </Tabs>
  );
}

export default Home;