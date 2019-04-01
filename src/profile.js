import React, { Component } from 'react';
import './App.css';
import Amplify, { Auth, Storage } from 'aws-amplify';
import awsmobile from './aws-exports';

Amplify.configure(awsmobile);

class Profile extends Component {

	constructor(props) {
	    super(props);
	    this.state = {
	      nom: '',
	      prenom: '',
	      age: '',
        sub:'',
	    };
	    
	    this.handleChange = this.handleChange.bind(this);
	    this.LogOut = this.LogOut.bind(this);
      this.Save = this.Save.bind(this);
      this.Load = this.Load.bind(this);

      Auth.currentAuthenticatedUser({
    bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
}).then(user => {
  this.state.sub = user.attributes.sub;
  this.Load();
  //console.log(this.state.sub);
 
})
.catch(err => console.log(err));

 	}

  Load(){
    Storage.get(this.state.sub+'.json', {level: 'public'})
      .then(result => {
        //console.log('get result'+result);

        fetch(result)
          .then(response => response.json())
            .then(data => {
              //console.log("data :" + JSON.stringify(data));
              this.setState({nom:data.nom});
              this.setState({prenom:data.prenom});
              this.setState({age:data.age});
            })
            .catch(error => {console.log(error);
          });
      })
      .catch(err => console.log(err));
  }

	LogOut(){
    Auth.signOut()
    .then((data) => {
        this.props.history.push('/');
      })
      .catch(err => console.log(err));  
  }

  Save(){
    console.log("Save my data !");
    Storage.put(this.state.sub+".json", JSON.stringify(this.state), {
        level: 'public',
        contentType: 'text/plain'
      })
      .then (result => {console.log(result);})
      .catch(err => console.log(err));  
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
    	<div>
    	<h1>My profile</h1><br></br>
      		<label>Nom</label> <input type="text" name="nom" value={this.state.nom} onChange={this.handleChange} onBlur={this.Save}/><br></br>
      		<label>Prénom</label> <input type="text" name="prenom" value={this.state.prenom} onChange={this.handleChange} onBlur={this.Save}/><br></br>
      		<label>Age</label> <input type="text" name="age" value={this.state.age} onChange={this.handleChange} onBlur={this.Save}/><br></br>
      		<button onClick={this.LogOut}>Logout</button>
		</div>
    );
      
  }
}

export default Profile;
