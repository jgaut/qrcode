import * as openpgp from 'openpgp';

export const initTools = async() => {
  //var openpgp = require('openpgp');
  openpgp.config.debug = true;
  //await openpgp.initWorker({ path: './openpgp.worker.min.js'});
}

export const encodePgp = async(message, code) => {

  if(message===""){
    return;
  }
  var options, encrypted, b64encoded;
  var uint8array = new TextEncoder("utf-8").encode(message);

  //console.log(key, message, code);

  options = {
      message: await openpgp.message.fromBinary(uint8array),
      passwords: [code],
      armor: false
  };

  await openpgp.encrypt(options).then(
    async (ciphertext) => {
      encrypted = ciphertext.message.packets.write();
      b64encoded = btoa(String.fromCharCode.apply(null, encrypted));
    }
  );
  //console.log('encodePgp : '+message+ ' --> '+b64encoded);
  return b64encoded;
}

export const decodePgp = async (message, code) => {

  if(message===""){
    return;
  }
  var u8_2 = new Uint8Array(atob(message).split("").map(function(c) {return c.charCodeAt(0); }));
  var options, string;
  
  options = {
    message: await openpgp.message.read(u8_2),
    passwords: [code],
    format: 'binary'
  };

  await openpgp.decrypt(options).then((plaintext)=> {
    string = new TextDecoder("utf-8").decode(plaintext.data);
    //console.log("decode string : " + string);
  }).catch(err => {
    //console.log("erreur lors du déchiffrement : " +err);
    console.log("Erreur lors du déchiffrement : Veuillez vérifier votre master key.");
    return;
  });
  //console.log("decode2 string : " + string);
  return string;
}
