import React, { Component } from 'react';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    console.log(event);
    this.setState({value: event.target.value});
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          
          <form>
  <label>
    email <input type="text" name="email" value={this.state.email} onChange={this.handleChange}/>
  </label>
  <br></br>
    <label>
    Password <input type="password" name="password" value={this.state.password} onChange={this.handleChange} />
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
