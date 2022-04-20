const crypto = require('crypto')
const secp256k1 = require('secp256k1')
const ripemd160 = require('ripemd160')
const keccak256 = require('keccak256')
const base58check = require('base58check')
const prompt = require('prompt')
const colors = require('colors/safe')
const fs = require('fs')
const path = require('path')


function getPrivateKey () {
  while (true) {
    const privKey = crypto.randomBytes(32)
    if (secp256k1.privateKeyVerify(privKey)) return privKey
  }
}

function toChecksumAddress(address) {
  var ret = '0x'; 
  for (var i = 0; i < address.length; i++) {   
      if (parseInt(address[i], 16) >= 8) {     
          // ret += address[i].toUpperCase();
          ret += address[i];  
      } else {     
          ret += address[i];   
      } 
  } 
  return ret;
}

function log(message, type = 'white') {
  console.log(colors[type](message))
}

const wallet = {
  createWalletOfBTC: function () {
    const privKey = getPrivateKey()
    log(`私钥: ${privKey.toString('hex')}`, 'brightMagenta')
    const pubKey = secp256k1.publicKeyCreate(privKey)
    const pubKeyString = Buffer.from(pubKey).toString('hex')
    log(`公钥: ${pubKeyString}`)
    const sha256Value = crypto.createHash('sha256').update(pubKeyString, 'hex').digest('hex')
    const ripemd160Value = new ripemd160().update(sha256Value, 'hex').digest('hex')
    log(`钱包地址: ${ripemd160Value}`)
    const wallet = base58check.encode(ripemd160Value)
    log(`base58钱包地址: ${wallet}`)

    var btc_address = [`${ripemd160Value}`, `${privKey.toString('hex')}`, `${pubKeyString}`]
    fs.appendFileSync("./btc_address.csv",  `${eth_address}`, error => {
      if (error) return console.log("写入文件失败,原因是" + error.message);
      console.log("写入成功");
    });
    fs.appendFileSync("./btc_address.csv",  "\n", error => {
      if (error) return console.log("写入文件失败,原因是" + error.message);
      console.log("写入成功");
    });
    log(`钱包: ${eth_address}`)
  },


  createWalletOfETH: function () {
    // const privKey = getPrivateKey()
    // log(`私钥: ${privKey.toString('hex')}`, 'brightMagenta')
    // const pubKey = secp256k1.publicKeyCreate(privKey, false).slice(1)
    // const pubKeyString = Buffer.from(pubKey).toString('hex')
    // log(`公钥: ${pubKeyString}`)
    // const address = keccak256(Buffer.from(pubKeyString, 'hex')).slice(-20).toString('hex');
    // log(`钱包地址: ${toChecksumAddress(address)}`)
    // const wallet = base58check.encode(address)
    // log(`base58钱包地址: ${wallet}`)
    
    //引入ethers.js
    var  ethers = require('ethers');
    //拿到生成的钱包信息
    var wallet = ethers.Wallet.createRandom();
    //获取助记词
    var mnemonic = wallet.mnemonic;
    console.log("钱包助记词：",mnemonic['phrase'])
    //获取path
    var path = wallet.path;
    console.log("钱包path：",path)
    //获取钱包的私钥
    var privateKey = wallet.privateKey;
    console.log("钱包私钥：",privateKey)
    //获取钱包地址
    var address = wallet.address;
    console.log("钱包地址：",address)

// 将地址存储到文件
    var eth_address = [`${address}`, `${privateKey}`, `${mnemonic['phrase']}`]
    fs.appendFileSync("./eth_address_test.csv",  `${eth_address}`, error => {
      if (error) return console.log("写入文件失败,原因是" + error.message);
      console.log("写入成功");
    });
    fs.appendFileSync("./eth_address_test.csv",  "\n", error => {
      if (error) return console.log("写入文件失败,原因是" + error.message);
      console.log("写入成功");
    });
    log(`钱包: ${eth_address}`)
  }
}

prompt.start();
prompt.get([
  {
    description: '想要比特币钱包还是以太坊钱包（填写BTC或ETH,必须是大写）',
    name: 'walletType'
  },
  {
    description: '想要多少个钱包',
    name: 'walletNum'
  }
], (_, { walletType, walletNum }) => {
  const createWallet = wallet[`createWalletOf${walletType}`];
  if (!createWallet) {
    return log('钱包类型填错了！', 'red')
  }
  for (let i = 1, len = walletNum; i <= len; i++) {
    const driver = `==(${i})================================================================`;
    log(driver, 'green')
    createWallet()
    log(new Array(driver.length + 1).join('='), 'green')
  }
});
