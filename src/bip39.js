import React, { Component } from 'react';
import './App.css';
import Amplify, { Auth } from 'aws-amplify';
import awsmobile from './aws-exports';
import ls from 'local-storage';
import Mnemonic from 'bitcore-mnemonic';
import img from './logo.png';

Amplify.configure(awsmobile);

class Bip39 extends Component {

  constructor(props) {
    super(props);
    this.sub='';
    this.state={};
    this.handleChange = this.handleChange.bind(this);
    this.Generate = this.Generate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.Cancel = this.Cancel.bind(this);
    this.showSate = this.showSate.bind(this);
    this.state.err='';

 	}

  async componentWillMount(){
    //await this.setState({['data'] : [{'actualKey':''}, {'newKey':''}]);
    Auth.currentAuthenticatedUser({bypassCache: false})
    .then((user) => {}
    ).catch((err) => {
      console.log("err : "+ err);
      this.props.history.push('/');
      }
    )  
  }

  componentDidMount(){
    console.log('did');
    Auth.currentAuthenticatedUser({bypassCache: false})
    .then(user => {
      console.log(user);
      this.sub = user.attributes.sub;
      console.log(this.sub);
      console.log(JSON.stringify(ls.get(this.sub)));
      var code = JSON.stringify(ls.get(this.sub))==="{}"?"Generate one and validate !":JSON.stringify(ls.get(this.sub));
      this.setState({['actualKey']:code}, console.log("state : "+JSON.stringify(this.state)));
      this.setState({['newKey']:''}, console.log("state : "+JSON.stringify(this.state)));
      console.log("state : "+JSON.stringify(this.state));
    })
    .catch(err => console.log(err));
  }

  Cancel(){
    this.props.history.push('/');
  }

  handleSubmit(){
    if(Mnemonic.isValid(this.state['newKey'])){
      console.log("Change my master key");
      //console.log()
      //this.setState({['actualKey']:})
      ls.set(this.sub, this.state['newKey']);
      this.props.history.push('/profile');
    }else{
      console.log("Change my master key");
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

  async Generate(){
    //console.log("need to generate a new mnemonic");
    var code = await new Mnemonic(Mnemonic.Words.FRENCH);
    //console.log(code.phrase);
    this.setState({['newKey']: code.phrase.toString()});
    this.setState({['submit']: Mnemonic.isValid(code)});
    //console.log(this.sub);
  }

  showSate(){
    console.log(this.state);
  }

  render() {

    console.log("Render : " + this.state['newKey'] + " ::: " + Mnemonic.isValid(this.state['newKey']));
    let submit = Mnemonic.isValid(this.state['newKey']);
    return (
      <div>
    <div className="logo"><img src={img}/></div>
      <div className="container">
      <div style={{"textAlign": "left"}}>
        <h2>Manage Master Key</h2>
      </div>
      <form onSubmit={this.handleSubmit}>
        
        <div className={this.state.error==='' ? 'hidden-label': 'row error-label'}>
          <label>{this.state.error}</label>
        </div>
        
        <div className="row">
          <div className="col-25">
            <label htmlFor="actualKey">Actual key</label>
          </div>
          <div className="col-75">
            <input type="text" readOnly="true" id="actualKey" name="actualKey" placeholder="Actual key" value={this.state['actualKey']} onChange={this.handleChange}/>
          </div>
        </div>
        
        <div className="row">
          <div className="col-25">
            <label htmlFor="newKey">New key</label>
          </div>
          <div className="col-75">
            <input type="text" id="newKey" name="newKey" placeholder="New key" value={this.state['newKey']} onChange={this.handleChange}/>
          </div>
        </div>
        
        <div className="row">
        
        <input type="submit" value="Validate" disabled={this.state['submit']}/>
          
        </div>
      </form>
      <div className="row">
      <button onClick={this.Generate}>Generate</button>
      <button onClick={this.Cancel}>Cancel</button>
      {/*<button onClick={this.showSate}>Show state</button>*/}
      </div>
    </div>
    </div>
    );
      
  }
}

export default Bip39;
