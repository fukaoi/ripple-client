const Client = require('./client');
const Address = require('./address');

module.exports = class Payment {
  
  constructor(masterAddress) {
    this.masterAddress = masterAddress; 
    this.api = Client.instance;
  }

  createSouce(amount, tag = 0) {
    let obj = {
      source: {address: this.masterAddress,
      amount: {value: amount, currency: 'XRP'}}
    };
    if (tag > 0) obj.source.tag = tag;
    return obj;
  }

  createDestination(amount, toAddress, tag = 0) {
    let obj = {
        destination: {address: toAddress, 
        // minAmount:   {value: '' + amount, currency: 'XRP' }} // check, need??? 
        minAmount:   {value: amount, currency: 'XRP' }}  
    };
    if (tag > 0) obj.destination.tag = tag;
    return obj;
  }

  setupTransaction(srcObj, destObj, memos = []) {
    let merged = Object.assign(srcObj, destObj) 
    if (memos.length) merged.memos = memos;
    return merged;
   }

  static setupFee() {
    return 0.00001; 
  }

  async preparePayment(txRaw, quorum) {
    try {
      const add = new Address();
      const seq = await add.getSequence(this.masterAddress);

      await this.api.connect();
      const instructions = {
        fee: `${Payment.setupFee()}`,  
        sequence: seq,
        signersCount: quorum 
      };
      const txJson = await this.api.preparePayment(
        this.masterAddress, 
        txRaw,
        instructions
       );
       return txJson;
    } catch(e) {
      throw new Error(e); 
    } finally {
      await this.api.disconnect();
    }
  }
}
