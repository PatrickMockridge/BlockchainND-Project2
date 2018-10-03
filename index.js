const { Blockchain, Block } = require('./simpleChain');
const { errorFunction } = require('./levelSandbox')
let blockchain = new Blockchain();

module.exports = {

  generateBlocks : () => {
    (async function loop() {
        for (let i = 0; i < 10; i++) {
            console.log('creating block ' + i);
            await blockchain.addBlock(new Block('test data' + i));
        }
    })();
  },
  generateChecks : () => {
    (async function loop() {
        let h = await blockchain.getBlockHeight();
        console.log('Blockchain height: ' + h);
        for (let i = 0; i < h; i++) {
            let b = await blockchain.getBlock(i);
            console.log('block #' + i + ' - ' + b.body + ' - ' + b.previousBlockHash);
        }
    })();
    blockchain.validateChain();
  },
  generateErrors : () => {
    (async function loop() {
        let inducedErrorBlocks = [2, 4, 7];
        for (let i = 0; i < 3; i++) {
            let key = inducedErrorBlocks[i];
            let b = await errorFunction(blockchain, key);
        }
    })();
    blockchain.validateChain();

  }
}
require('make-runnable');
