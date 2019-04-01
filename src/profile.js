import React, { Component } from 'react';
import './App.css';

class Profile extends Component {

	  constructor(props) {
    super(props);
    this.state = {
      nom: '',
      prenom: '',
      age: ''
    };
    
    this.handleChange = this.handleChange.bind(this);
    //this.onSubmit = this.onSubmit.bind(this);

  }

	componentWillMount(){  
	}

  handleChange(event) {
    //console.log(event.target);

    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  render() {

    return (
    	<div>My profile
      		<label>Nom</label> <input type="text" name="nom" value={this.state.nom} onChange={this.handleChange}/><br></br>
      		<label>Prénom</label> <input type="text" name="prenom" value={this.state.prenom} onChange={this.handleChange}/><br></br>
      		<label>Age</label> <input type="text" name="age" value={this.state.age} onChange={this.handleChange}/><br></br>
		</div>
    );
      
  }
}

export default Profile;
