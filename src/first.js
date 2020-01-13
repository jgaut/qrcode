import React, { Component } from 'react';
import './App.css';
import Amplify, { Auth } from 'aws-amplify';
import awsmobile from './aws-exports';
import ls from 'local-storage';
import Mnemonic from 'bitcore-mnemonic';

Amplify.configure(awsmobile);

class Bip39 extends Component {

	constructor(props) {
    super(props);
    this.state = {
      actualKey:'',
      newKey:''
    };

    this.sub='';

    this.handleChange = this.handleChange.bind(this);
    this.Generate = this.Generate.bind(this);
    this.Validate = this.Validate.bind(this);
    this.Cancel = this.Cancel.bind(this);

 	}

  componentWillMount(){
    Auth.currentAuthenticatedUser({bypassCache: false})
    .then((user) => {}
    ).catch((err) => {
      console.log("err : "+ err);
      this.props.history.push('/');
      }
    )  
  }

  componentDidMount(){
    Auth.currentAuthenticatedUser({bypassCache: false})
    .then(user => {
      this.sub = user.attributes.sub;
      this.setState({actualKey:ls.get(this.sub)});
    })
    .catch(err => console.log(err));
  }

  Cancel(){
    this.props.history.push('/');
  }

  Validate(){
    console.log("Change my master key");
    ls.set(this.sub, this.state.newKey);
    this.props.history.push('/profile', {action:"new_master_key", oldKey:this.state.actualKey});
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

  Generate(){
    console.log("need to generate a new mnemonic");
    this.setState({newKey: new Mnemonic(Mnemonic.Words.FRENCH)});
  }

  render() {

    return (
      <div>
    <h1 style={{"textAlign": "center"}}>Manage Master Key</h1>
    <table>
    <tbody> 
      <tr>
          <td>
            <label>Actual key</label>
          </td>
          <td>
            {this.state.actualKey}
          </td>
        </tr>
        <tr>
          <td>
            <label>New key</label>
          </td>
          <td>
            <input type="text" name="newKey" size="80" value={this.state.newKey} onChange={this.handleChange}/>
          </td>
        </tr>
        <tr>
          <td colspan='2' style={{"textAlign": "center"}}>
            <button onClick={this.Generate}>Generate</button>
          </td>
        </tr>
        <tr>
          <td colspan='2' style={{"textAlign": "center"}}>
            <button onClick={this.Validate}>Validate</button>
          </td>
        </tr>
        <tr>
          <td colspan='2' style={{"textAlign": "center"}}>
            <button onClick={this.Cancel}>Cancel</button>
          </td>
        </tr>
        <tr>
          <td colspan='2'>
            <label>{this.state.err}</label>
          </td>
        </tr>
      </tbody> 
    </table>
    </div> 
    );
      
  }
}

export default Bip39;
