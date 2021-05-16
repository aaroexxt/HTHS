import React from 'react';
import PropTypes from 'prop-types';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'

export default class MainMap extends React.Component {
	constructor() {
		super()
	}

	render() {
		return (<Map
			className="mapBox"
			center={this.props.position}
			zoom={this.props.zoom}
			scrollWheelZoom={false}
			>
			<TileLayer
			attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWFyb2V4eHQiLCJhIjoiY2pweDVtbGhrMGI1ODQybzE2dmp3M29rMiJ9.elzqxiOUZxYhvUdht6uUfQ"
			id='mapbox/streets-v11'
			/>
			{this.props.markers.map((position, idx) =>
	          <Marker key={`marker-${idx}`} position={position}>
	          <Popup>
	            <span>A pretty CSS3 popup. <br/> Easily customizable.</span>
	          </Popup>
	        </Marker>
	        )}
		</Map>
	)
	}
}

/*
<Marker position={position}>
<Popup>
A pretty CSS3 popup. <br /> Easily customizable.
</Popup>
</Marker>
 */
