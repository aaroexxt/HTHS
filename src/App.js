import logo from './logo.svg';
import './App.css';

import NavHeader from "./NavHeader.jsx";
import InfoBlock from "./InfoBlock.jsx";

function App() {
  return (
    <div className="App">
		<NavHeader />
		<div className="mapBox" id="map" />
		<InfoBlock />
    </div>
  );
}

export default App;
