/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

/* ===== Persist data with LevelDB ===========================
|  Learn more: level: https://github.com/Level/level         |
|  =========================================================*/

const level = require('level');
const chainDB = './chaindata';
const leveldb = require('./levelSandbox');

/* ===== Block Class =========================================
|  Class with a constructor for block 			                 |
|  =========================================================*/
class Block {
  constructor(data) {
    this.hash = "",
      this.height = 0,
      this.body = data,
      this.time = 0,
      this.previousBlockHash = ""
  }
}

// The key to store the block height
const heightKey = 'heightKey';

/* ===== Blockchain Class ====================================
|  Class with a constructor for new blockchain 	             |
|  =========================================================*/
class Blockchain {
  constructor () {
    leveldb.getChainLength().then(num => {
      if (num === 0) {
        this.addBlock(
          new Block('The Times 03/Jan/2009 Chancellor on brink of second bailout for banks')
        ).then(() => console.log('genesis block created'))
      }
    })
  }

  async addBlock (newBlock) {
    newBlock.height = await this.getChainLength()

    newBlock.time = new Date()
      .getTime()
      .toString()
      .slice(0, -3)

    if (newBlock.height > 0) {
      const prevBlock = await leveldb.getBlock(newBlock.height - 1)
      newBlock.previousBlockHash = prevBlock.hash
    }

    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString()

    await leveldb.addBlock(newBlock.height, JSON.stringify(newBlock))
  }

  async getChainLength () {
    const length = await leveldb.getChainLength()
    return length
  }

  async getBlock (blockHeight) {
    const block = await leveldb.getBlock(blockHeight)
    return block
  }

  async getChain () {
    const chain = await leveldb.getChain()
    return chain
  }

  async validateBlock (blockHeight) {
    const block = await this.getBlock(blockHeight)

    let blockHash = block.hash

    block.hash = ''

    let validBlockHash = SHA256(JSON.stringify(block)).toString()

    if (blockHash === validBlockHash) {
      console.log('Block #' + blockHeight + ' validated')
      return true
    } else {
      console.log(
        `Block #
          ${blockHeight}
          invalid hash:\n
          ${blockHash} <>
          validBlockHash`
      )
      return false
    }
  }

  async validateChain () {
    let errorLog = []
    let chainLength = await this.getChainLength()
    let chain = []
    for (let i = 0; i < chainLength; i++) {
      const valid = await this.validateBlock(i)
      if (!valid)errorLog.push(i)

      let block = await this.getBlock(i)
      let blockHash = block.hash
      if (i < ( chainLength - 1 )) {
        let nextBlock = await this.getBlock(i + 1)
        let previousHash = nextBlock.previousBlockHash
        block.isValid = valid
        chain.push(block)
        if (blockHash !== previousHash) {
            errorLog.push(i)
        }
      }



      if (errorLog.length > 0) {
        console.log('Block errors = ' + errorLog.length)
        console.log('Blocks: ' + errorLog)
      } else {
        console.log('No errors detected')
        }
        }
    return chain
  }
}




module.exports = {
  Block,
  Blockchain
};
