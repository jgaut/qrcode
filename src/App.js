import React, { Component } from 'react';
import './App.css';

class App extends Component {

  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
    };
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          
          <form>
  <label>
    email <input type="text" name="email" value={this.state.email} onChange={email => this.setState({ email })}/>
  </label>
  <br></br>
    <label>
    Password <input type="password" name="password" value={this.state.password} onChange={password => this.setState({ password })} />
  </label>
  <br></br>
  <input type="submit" value="Submit" />
  <br></br>
  <p>
  {this.state.email}
  </p>
  <p>
  {this.state.password}
  </p>
</form>
        </header>
      </div>
    );
  }
}

export default App;
