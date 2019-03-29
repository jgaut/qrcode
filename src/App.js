import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          
          <form>
  <label>
    Login <input type="text" name="login" />
  </label>
  <br></br>
    <label>
    Password <input type="text" name="password" />
  </label>
  <br></br>
  <input type="submit" value="Submit" />
</form>
        </header>
      </div>
    );
  }
}

export default App;
