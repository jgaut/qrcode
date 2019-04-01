import React, { Component } from 'react';
import './App.css';
import Amplify, { Auth, Storage } from 'aws-amplify';
import awsmobile from './aws-exports';
import QRCode from 'qrcode.react';
import ls from 'local-storage';

Amplify.configure(awsmobile);
      
class Profile extends Component {

	constructor(props) {
	    super(props);
	    this.state = {
	      nom: '',
	      prenom: '',
	      age: '',
	    };

  const { params } = this.props.match;
  const uuid = params.uuid;
  const key = params.key;

  fetch("https://s3-eu-west-1.amazonaws.com/qrcodebbae64624e2c4eaa95c85650b48ffb6c/public/"+uuid+".json")
    .then(response => response.json())
      .then(data => {
        //console.log("data :" + JSON.stringify(data));
        this.setState({nom:data.nom});
        this.setState({prenom:data.prenom});
        this.setState({age:data.age});
      })
      .catch(error => {console.log(error);});
 	}

  render() {
    return (
    	<div>
    	<h1>My profile</h1><br></br>
      		<label>Nom : {this.state.nom}</label><br></br>
      		<label>Prénom : {this.state.prenom}</label><br></br>
      		<label>Age : {this.state.age}</label><br></br>
		</div>
    );
      
  }
}

export default Profile;
