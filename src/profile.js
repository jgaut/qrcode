import React, { Component } from 'react';
import './App.css';

class Profile extends Component {

  componentWillMount(){
  	this.state = {
  		nom:'',
  		prenom:'',
  		age:''
  	}  
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
      		<label>Nom</label> <input type="text" name="nom" value={this.state.nom} onChange={this.handleChange}/>
      		<label>Prénom</label> <input type="text" name="prenom" value={this.state.prenom} onChange={this.handleChange}/>
      		<label>Age</label> <input type="text" name="age" value={this.state.age} onChange={this.handleChange}/>
		</div>
    );
      
  }
}

export default Profile;
