import React, { Component } from 'react';
import './App.css';
import {encodePgp, decodePgp, initTools} from './tools.js';
import awsmobile from './aws-exports';
import {gzip, ungzip} from 'node-gzip';
import arrayBufferToBuffer from 'arraybuffer-to-buffer';

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
  console.log(this.uuid);
  this.code = params.code;
  console.log(this.code);
  this.sizePict = 350;

  this.Load();
 	}

  async Load(){
    fetch("https://"+awsmobile.aws_user_files_s3_bucket+".s3."+awsmobile.aws_user_files_s3_bucket_region+".amazonaws.com/public/"+this.uuid+".json")
    .then(response => response.json())
      .then(data => {
        console.log("uuid :" + this.uuid);
        console.log("data :" + JSON.stringify(data));
        //Unzip
        data.arrayBuffer()
          .then(data=>{
            //console.log(arrayBufferToBuffer(data));
            ungzip(arrayBufferToBuffer(data))
              .then((data) => {
                //console.log("data :" + data+ " -- "+data.length); 
                var myData = JSON.parse(data.toString());
                if(myData.nom!==undefined){
                  for (let key in myData) {
                    this.loadAsync(key, myData[key]);
                  }
                }
              });
          })
          .catch(error => {console.log(error)}); 
      })
      .catch(error => {console.log(error);});
  }

  async loadAsync(key, message){
    //console.log(message);
    this.setState({[key]: await decodePgp(message, this.code)});
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
