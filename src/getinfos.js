import React, { Component } from 'react';
import './App.css';
import * as openpgp from 'openpgp'

class Profile extends Component {

	constructor(props) {
	    super(props);
	    this.state = {
	      nom: '',
	      prenom: '',
	      age: '',
	    };

  const { params } = this.props.match;
  this.uuid = params.uuid;
  this.key = params.key;
  
  openpgp.config.debug = true;

  openpgp.initWorker({ path: '/openpgp/dist/compat/openpgp.worker.min.js'});

  this.Load();
 	}

  async Load(){
    fetch("https://s3-eu-west-1.amazonaws.com/qrcodebbae64624e2c4eaa95c85650b48ffb6c/public/"+this.uuid+".json")
    .then(response => response.json())
      .then(data => {
        //console.log("data :" + JSON.stringify(data));
        for (var k in data) {
          this.decodePgp(k, data[k], this.key);
        }
      })
      .catch(error => {console.log(error);});
  }

  async decodePgp(key, message, code){
    //console.log(message);
    if(message===""){
      return;
    }
    var u8_2 = new Uint8Array(atob(message).split("").map(function(c) {return c.charCodeAt(0); }));
    var options;
    
    options = {
      message: await openpgp.message.read(u8_2),
      passwords: [code],
      format: 'binary'
    };

    openpgp.decrypt(options).then((plaintext)=> {
        var string = new TextDecoder("utf-8").decode(plaintext.data);
        //console.log("decode string : " + string);
        this.setState({
          [key]: string
        });
    });
  }

  processItems(itemArray) {
    // Create an empty array that will hold the final JSX output.
    let buffer = []

    for (var key in itemArray) {
      if(key === 'image'){

      }else{
      buffer.push(
        <tr>
        <td align="left">
        <label>{key}</label> 
        </td>
        <td>
        <input type="text" name={key} value={this.state[key]} readOnly/>
        </td>
        </tr>);
    }
  }

    // And return the buffer for display inside the render() function
    return (
        <table style={{margin:'auto'}}>
      <tbody>
      <tr>
      <td colSpan='2'>
      <img src={"data:image/png;base64,"+this.state.image} alt="Profile picture" style={{ width: this.sizePict+'px' }}/>
      </td>
      </tr>
      <tr>
      <td colSpan='2' style={{"textAlign": "center"}}>
      <input type="file"
       id="avatar" name="avatar"
       accept="image/png, image/jpeg" onChange={this.handleFiles} />
      </td>
      </tr>
      {buffer}
    <tr>
      <td colSpan='2' style={{"textAlign": "center", 'color':'red'}}>
        <label>{this.err}</label>
      </td>
      </tr>
    </tbody>
    </table>
    );
  }

  render() {
    return (
    <div>
    <h1 style={{"textAlign": "center"}}>Profile</h1>

    {this.processItems(this.state)}
    
    
    </div>  
    );
      
  }
}

export default Profile;
