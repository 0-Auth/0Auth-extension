import {makeAutoObservable} from 'mobx';
import {hash, Property, Signature} from "@0auth/message";
import {decryptMessage, encryptMessage, generateRandomKey} from "@0auth/client/lib/utils";

type LoginType = {
  isLogin: boolean;
  password: string;
}

class UserProperty {
  isStored: boolean = false;
  encryptedData: string = '';
  properties: { [host: string]: Property[] } = {};
  sign: { [host: string]: Signature } = {};
  key: string = '';

  constructor() {
    makeAutoObservable(this);
    this.init();
  }

  init() {
    chrome.storage.local.get(['encrypt'], async data => {
      const encryptedData = data.encrypt;
      if (encryptedData === undefined) {
        return;
      }
      this.isStored = true;
      this.encryptedData = encryptedData;
    });
  }

  storeKey(key: string) {
    chrome.storage.local.set({key: key}, () => console.log('키가 저장되었습니다.'))
  }

  setKey(key: string) {
    this.key = key;
  }

  loadProperties() {
    const data = JSON.parse(decryptMessage(this.encryptedData, this.key));
    this.properties = data.properties;
    this.sign = data.sign;
  }

  updateStorage() {
    this.encryptedData = encryptMessage(JSON.stringify({properties: this.properties, sign: this.sign}), this.key);
    chrome.storage.local.set({encrypt: this.encryptedData}, () => console.log('기록되었습니다.'))
  }

  updateProperties(host: string, properties: Property[]) {
    this.properties[host] = properties;
  }
}

const propertyStore = new UserProperty();
export default propertyStore;
