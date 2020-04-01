import React, { Component } from 'react';
import './App.css';
import Amplify, { Auth, Storage } from 'aws-amplify';
import awsmobile from './aws-exports';
import QRCode from 'qrcode.react';
import ls from 'local-storage';
import Mnemonic from 'bitcore-mnemonic';
import Resizer from 'react-image-file-resizer';
import {gzip, ungzip} from 'node-gzip';
import sha512 from 'sha512';
import arrayBufferToBuffer from 'arraybuffer-to-buffer';
import {encodePgp, decodePgp, initTools} from './tools.js';
import img from './logo.png';
import queryString from 'query-string';

Amplify.configure(awsmobile);

class Profile extends Component {

	constructor(props) {
    super(props);

    this.code = '';
    this.sub = '';
    this.ischange=false;
    this.qrcodeValue = '';
    this.qrcodesize = 350;
    this.dataLink = '';
    this.QRCodeVisibility='none';
    this.err='';
    this.sizePict=350;
    
    this.level = 'public' ;

    this.handleChange = this.handleChange.bind(this);
    this.LogOut = this.LogOut.bind(this);
    this.Save = this.Save.bind(this);
    this.Load = this.Load.bind(this);
    this.loadAsync = this.loadAsync.bind(this);
    this.ChangeMasterKey = this.ChangeMasterKey.bind(this);
    this.processItems = this.processItems.bind(this);
    this.ShowQRCode = this.ShowQRCode.bind(this);
    this.handleFiles = this.handleFiles.bind(this);
    this.DeletePicture = this.DeletePicture.bind(this);
    this.Reset = this.Reset.bind(this);
    this.ShowState = this.ShowState.bind(this);
    this.shuffle = this.shuffle.bind(this);
   
    initTools();

    this.parsed = queryString.parse(this.props.location.search);
    console.log(this.parsed);
    if(this.parsed.force==="true"){
      this.force=true;
    }else{
      this.force=false;
    }

 	}

  async componentDidMount(){

    await this.setState({['data'] : [
      {'l':'nom', 'v': '', 'p':0},
      {'l':'prenom', 'v': '', 'p':1},
      {'l':'age', 'v': '', 'p':2},
      {'l':'gs', 'v': '', 'p':3},
      {'l':'notes', 'v': '', 'p':4},
      {'l':'image', 'v': '', 'p':5}
      ]
    });
    //console.log(this.state['data']);

    if(!this.force){
      Auth.currentAuthenticatedUser({bypassCache: false})
      .then(user => {
        this.sub = user.attributes.sub;
        this.file = this.sub+'.json';
        this.Load();
      })
      .catch((err) => {
        console.log("err : "+ err);
        this.props.history.push('/');
        }
      );
    }else{
        this.sub = this.parsed.id;
        this.file = this.sub+".json";
        this.Load();
    }
  }

  Reset(){
    for(var k in this.state['data']){
      var tmp = this.state['data'][k];
      tmp.v=""
      this.setState({[k]: tmp}, ()=>{this.ischange=true;this.Save();});
    }
  } 

  async Load(){
    if(!this.force){
      if(!Mnemonic.isValid(ls.get(this.sub))){
        //console.log("need to generate a new mnemonic");
        this.props.history.push('/bip39');
      }
      this.code = ls.get(this.sub);
    }else{
      this.code = this.parsed.code;
    }

    
    console.log(this.file);
    await Storage.get(this.file, {level: this.level})
      .then(result => {
        //console.log("result : " +result.toString());
        fetch(result)
          .then(response =>
          {
            if (!response.ok) {
              /*for (var key in this.minFields){
                //console.log('add field : '+key +'==>'+myData[key]);
                if(!this.state['data'][key]){
                  //console.log('add field : '+key +'==>'+this.state['data'][key]);
                  this.setState({[key]:''});  
                }
              }*/
            }
            return response;})
            .then(data => {

              //console.log("myData : "+JSON.stringify(data));
              
              if(data===""){
                //console.log("data is empty");
              }else{
                //console.log("data is present");
              }

              //Unzip
              data.arrayBuffer()
                .then(data=>{
                  ungzip(arrayBufferToBuffer(data))
                    .then((data) => {

                      //Init with minimum fileds
                      //console.log(this.minFields);

                      //Add storaged fields
                      //console.log(data);
                      this.loadAsync(data);
                      
                    });
                })
                .catch(error => {console.log(error)});              
            })
            .catch(error => {console.log(error);
          })
          .catch(error=>{console.log(error)});
      })
      .catch(error => console.log(error));
  }

  async loadAsync(data){
    //console.log("data : " + data);
    data = await decodePgp(data, this.code);
    data = JSON.parse(data); 
    //console.log("data : " + data);
    
    var tmp = [];
    for(var k in data){
      //console.log(data[k]);
      tmp.push(data[k]);
    }
    //console.log(tmp);
    tmp.sort(function compare(a,b){
      if(a.p>b.p){
        return 1;
      }else{
        return -1;
      }
    })
    //console.log(tmp);
    
    //console.log(tmp);

    for(var k in tmp){
      //console.log(data[k]);
      this.setState({['data']:{...this.state['data'], [k]:tmp[k]}});
    }
    //console.log(this.state);
    this.forceUpdate();
  }

  shuffle(array) {
  var copy = [], n = array.length, i;

  // While there remain elements to shuffle…
  while (n) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * array.length);

    // If not already shuffled, move it to the new array.
    if (i in array) {
      copy.push(array[i]);
      delete array[i];
      n--;
    }
  }

  return copy;
}

	LogOut(){
    Auth.signOut()
    .then((data) => {
        this.props.history.push('/');
      })
      .catch(err => console.log(err));  
  }

  async Save(){
    
    if(!this.ischange){
      return;
    }
    //console.log("Process to save data...");

    var tmp = [];
    var copyState={};
    for(var k in this.state['data']){
      //console.log(data[k]);
      tmp.push(this.state['data'][k]);
    }
    tmp = this.shuffle(tmp);
    for(k in tmp){
      copyState[k]=tmp[k];
    }
    copyState=JSON.stringify(copyState);
    //console.log("copyState :" + copyState);
    

    copyState = await encodePgp(copyState, this.code);

    //console.log("copyState :" + copyState);

    Storage.put(this.file, await gzip(copyState), {
      level: this.level,
      contentType: 'text/plain'
    })
    .then (result => {
      //console.log("Data saved");
      this.ischange=false;
      this.forceUpdate();
    })
    .catch(err => console.log(err));

  }

  handleChange(event) {
    //console.log('handleChange');
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const id = target.id;
    //console.log(target);
    //console.log(this.state['data'][id]);
    //console.log(this.state['data']);
    var tmp=this.state['data'][id];
    tmp.v=value;
    //console.log(tmp);
    this.setState({[id] : tmp},()=>{this.ischange=true;});
    //console.log(this.state['data']);
  }

  ChangeMasterKey(){
    this.props.history.push('/bip39');
  }

  DeletePicture(){
    for(var k in this.state['data']){
      if(this.state['data'][k].l==='image'){
        var tmp = this.state['data'][k];
        tmp.v="";
        this.setState({[k]: tmp}, ()=>{this.ischange=true; this.Save();});
      }
    }
  }
  

  processItems(itemArray) {

    // Create an empty array that will hold the final JSX output.
    let buffer = [];

    //console.log(this.state['data']);
    //console.log("Process graphics");
    for (var key in itemArray) {
      //console.log(key);
      ///console.log(itemArray[key]);
      let obj = itemArray[key];
      if(obj.l === 'image'){
        //console.log(obj.v);
          buffer.unshift(
            <div className="row" key={key} style={{"textAlign": "center"}}>
              <img src={obj.v==="" || obj.v===undefined?"":"data:image/png;base64,"+obj.v} alt="Profile picture" style={!obj.v || obj.v===''?{visibility: 'hidden' }:{ width: this.sizePict+'px' }}/>
              <br></br>
               <input type="file"
                      id="avatar" name="avatar"
                      accept="image/png, image/jpeg" onChange={this.handleFiles} />
         <button onClick={this.DeletePicture}>Delete picture</button>
            </div>

          );
        
      }else{
        buffer.push(
          <div className="row" key={key+":"+obj.l}>
            <div className="col-25">
              <label htmlFor={obj.l}>{ obj.l.charAt(0).toUpperCase() + obj.l.slice(1)}</label>
            </div>
            <div className="col-75">
              <input type="text" id={key} name={obj.l} placeholder={ obj.l.charAt(0).toUpperCase() + obj.l.slice(1)} value={this.state['data'][key].v} onChange={this.handleChange} onBlur={this.Save}/>
            </div>
          </div>
        );
      }
    }

    let statusClass = [
      'container',
      'status'
    ]
    statusClass = statusClass.join(' ')

    // And return the buffer for display inside the render() function
    return (
      
      <div>

      <div className={statusClass}>{!this.ischange?"SAVED":"SAVING..."}</div>
      <div>
      {buffer}

      <div className="row" style={{"textAlign": "center"}}>
        
        <button style={{"display":!this.force}} onClick={this.LogOut}>LOGOUT</button>
        <button onClick={this.ChangeMasterKey}>CHANGE MASTER KEY</button>
        <button onClick={this.ShowQRCode}>SHOW QRCODE</button>  
        {/*<button onClick={this.Reset}>RESET</button>  
        <button onClick={this.ShowState}>SHOW STATE VAR</button>*/} 
      </div>
      
      <div className="row" style={{"display":this.QRCodeVisibility, "textAlign": "center"}}>
        <QRCode value={this.qrcodeValue} size={this.qrcodesize} includeMargin={true}/>
      </div>

      
  
    </div>
    <div style={{"textAlign": "center", color:'red'}}>
        <label>{this.err}</label>
      </div>
    </div>
    
    );
  }

  ShowState(){
    console.log(this.state['data']);
  }

  ShowQRCode() {
    if(this.QRCodeVisibility==="none"){
      this.QRCodeVisibility="";
    }else{
      this.QRCodeVisibility="none";
    }
    this.forceUpdate();
  }

  handleFiles(event){
    var fileInput = false
        if(event.target.files[0]) {
            fileInput = true
        }
        if(fileInput) {
          //console.log(event.target.files[0]);
          this.err = JSON.stringify(event.target.files[0]);
            Resizer.imageFileResizer(
                event.target.files[0],
                this.sizePict,
                this.sizePict,
                'JPEG',
                100,
                0,
                uri => {
                    //console.log(uri);
                    var img = uri.split("base64,");
                    for(var k in this.state['data']){
                      if(this.state['data'][k].l==='image'){
                        var tmp = this.state['data'][k];
                        tmp.v=img[1];
                        this.setState({[k]: tmp}, ()=>{this.ischange=true; this.Save();});
                      }
                    }
                },
                'base64'
            );
        }
  }


  render() {
    this.qrcodeValue = awsmobile.aws_content_delivery_url+"/profile/?force=true&id="+encodeURIComponent(this.sub)+"&code="+encodeURIComponent(this.code);
    this.qrcodeValue2 = "http://localhost:3000"+"/profile/?force=true&id="+encodeURIComponent(this.sub)+"&code="+encodeURIComponent(this.code);
    //this.qrcodeValue = "http://localhost:3000"+"/getinfos/"+encodeURIComponent(this.sub)+"/"+encodeURIComponent(this.code);
    //this.dataLink = "https://s3-eu-west-1.amazonaws.com/qrcodebbae64624e2c4eaa95c85650b48ffb6c/public/"+this.sub+".json";
    console.log(this.qrcodeValue2);

    
    return (
    <div>
    <div className="logo"><img src={img}/></div>
      <div className="container">
      <div style={{"textAlign": "left"}}>
        <h2>Profile</h2>
      </div>

      {this.state!=undefined?this.processItems(this.state['data']):"Loading..."}
    </div> 
    </div>  
    );
      
  }
}

export default Profile;
