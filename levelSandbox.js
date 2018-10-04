/* ===== Persist data with LevelDB =============================  |
|  Learn more: level: https://github.com/Level/level              |
|  ============================================================= */

const level = require('level')
const chainDB = './chaindata';
const db = level(chainDB)

module.exports = {
  addBlock: (k, v) => {
    return new Promise((res, rej) => {
      db.put(k, v, err => {
        if (err) rej(err)
        res('Added block #' + k)
      })
    })
  },

  getBlock: k => {
    return new Promise((res, rej) => {
      db.get(k, (err, v) => {
        if (err) rej(err)
        try {
        res(JSON.parse(v))
        }
        catch (err) {
          
        }
      })
    })
  },

  getChainLength: () => {
    return new Promise((res, rej) => {
      let length = 0
      db.createReadStream()
        .on('data', data => {
          length++
        })
        .on('error', err => {
          rej(err)
        })
        .on('close', () => {
          res(length)
        })
    })
  },

  getBlockStream: () => {
    return db.createReadStream()
  },

  getChain: () => {
    return new Promise((res, rej) => {
      let chain = []
      db.createReadStream()
        .on('data', data => {
          chain.push(JSON.parse(data.value))
        })
        .on('error', err => {
          rej(err)
        })
        .on('close', () => {
          res(chain)
        })
    })
  },
  errorFunction: (blockchain, k) => {
    blockchain.getBlock(k).then(block => {
      block.body = 'induced chain error';
      db.put(k, JSON.stringify(block), (err) => {
        if (err) console.log(err);
      })
    });
  }
}
