import React, { Component } from 'react';
import './App.css';

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

  console.log("uuid : " + uuid);
  console.log("key : " + key);
  
  fetch("https://s3-eu-west-1.amazonaws.com/qrcodebbae64624e2c4eaa95c85650b48ffb6c/public/"+uuid+".json")
    .then(response => response.json())
      .then(data => {
        //console.log("data :" + JSON.stringify(data));
        for (var key in data) {
          this.setState({
            [key]: data[key]
          });
        }
      })
      .catch(error => {console.log(error);});
 	}

  render() {
    return (
    	<div>
    	<h1>My profile</h1><br></br>
      		<label>Nom</label> <input type="text" name="nom" value={this.state.nom} readonly/><br></br>
          <label>Prénom</label> <input type="text" name="prenom" value={this.state.prenom} readonly/><br></br>
          <label>Age</label> <input type="text" name="age" value={this.state.age} readonly/><br></br>
          <label>Notes</label> <textarea name="notes" rows="5" value={this.state.notes} readonly/><br></br>
		</div>
    );
      
  }
}

export default Profile;
