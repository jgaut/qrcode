import React, { Component } from 'react';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      value:''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    console.log(event.target);

    switch(event.target.name){
      case 'email' :
        this.setState({email: event.target.value});
        break;
      case 'password' :
        this.setState({password: event.target.value});
        break;
    }
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state);
    event.preventDefault();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          
          <form onSubmit={this.handleSubmit}>
            <label>
              Email <input type="text" name="email" value={this.state.email} onChange={this.handleChange}/>
            </label>
            <br></br>
              <label>
              Password <input type="password" name="password" value={this.state.password} onChange={this.handleChange} />
            </label>
            <br></br>
            <input type="submit" value="Login / Sign Up" />
          </form>
        </header>
      </div>
    );
  }
}

export default App;
