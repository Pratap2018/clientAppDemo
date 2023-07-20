let account;
let chainId;
let didDocument;
let offlineSigner;
let credentialDoc;
let did;
let issueCredential;
let presentation;
let signedPresentation;
let didDoc;
let signedDidDoc;
let resolvedDidDoc;
let privateKey;
const issuerDid =
  "did:hid:testnet:zCoEsFtqdkgYetBH6EnX4T9nFsLuNKSEpdkV4e4mFAGxT";
import { Bip39 } from "@cosmjs/crypto";
const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { Slip10RawIndex } = require("@cosmjs/crypto");
// let did = "did:hid:testnet:z2JFAEgfG5b7PhjHmCGuAeRPzqUaJ3Te9LUycbDMRzDwH";

const nodeRpcEndpoint = "https://rpc.jagrat.hypersign.id";
const nodeRestEndpoint = "https://api.jagrat.hypersign.id";
const apiBaseUrl = "https://api.entity.hypersign.id/api/v1/did";
const accessToken =
  "yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6ImQ2N2NkNjEyNTE2NzY0MmEyMjhjNzRjNTcwZGU5YjZjYzQ0OCIsInVzZXJJZCI6InZhcnNoYWt1bWFyaTM3MEBnbWFpbC5jb20iLCJncmFudFR5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJpYXQiOjE2ODkzMzE3MjMsImV4cCI6MTY4OTM0NjEyM30.51T35D6vjQ1HtH5cHiZQ4iQH4_hUXHTymDMiK51sdqA";
const Web3 = require("web3");
const {
  HypersignDID,
  HypersignVerifiableCredential,
  HypersignVerifiablePresentation,
} = require("hs-ssi-sdk");
// const {
//   HypersignDID,
//   HypersignVerifiableCredential,
// } = require("../build/src/index");

document.getElementById("generateToken").addEventListener("click", async () => {
  let resp = await fetch("https://api.entity.hypersign.id/api/v1/app/oauth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Secret-Key":
        "9f9be62f5c7fb0dcda6248612c4f0.dbf4a8877fd7267f45c9b7dce880294c2fd711a8bd604d97ba2f58cdebc8adff4ff9bbe25dd4956893d613101d86590d9",
    },
  });
  console.log(await resp.json());
});

document
  .getElementById("metamaskConnect")
  .addEventListener("click", async () => {
    if (!ethereum) {
      alert("Install Metamusk");
    }
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    account = Web3.utils.toChecksumAddress(accounts[0]);
    console.log(account);
    chainId = await ethereum.request({ method: "eth_chainId" });
    document.getElementById("address").innerHTML = account;
    document.getElementById("chainId").innerHTML = chainId;
  });

function makeCosmoshubPath(a) {
  return [
    Slip10RawIndex.hardened(44),
    Slip10RawIndex.hardened(118),
    Slip10RawIndex.hardened(0),
    Slip10RawIndex.normal(0),
    Slip10RawIndex.normal(a),
  ];
}
const mnemonic =
  "cart blind guard cactus unit desk effort there always basic cram hole coin hire century can strategy motor cheap exist field chapter dolphin boring";
const createWallet = async (mnemonic) => {
  let options;
  if (!mnemonic) {
    return await DirectSecp256k1HdWallet.generate(
      24,
      (options = {
        prefix: "hid",
        hdPaths: [makeCosmoshubPath(0)],
      })
    );
  } else {
    return await DirectSecp256k1HdWallet.fromMnemonic(
      mnemonic,
      (options = {
        prefix: "hid",
        hdPaths: [makeCosmoshubPath(0)],
      })
    );
  }
};

document.getElementById("createDID").addEventListener("click", async () => {
  offlineSigner = await createWallet(mnemonic);
  const hypersignDid = new HypersignDID({ namespace: "testnet" });
  didDoc = await hypersignDid.createByClientSpec({
    methodSpecificId: account,
    address: account,
    clientSpec: "eth-personalSign",
    chainId: "0x1",
    // verificationRelationships: [
    //   "authentication",
    //   "assertionMethod",
    //   "capabilityDelegation",
    // ],
  });
  console.log(didDoc);
  did = didDoc.id;
});

document
  .getElementById("signByClientSpec")
  .addEventListener("click", async () => {
    const hypersignDid = new HypersignDID({
      namespace: "testnet",
    });
    const web3Obj = new Web3(window.web3.currentProvider);
    window.web3 = web3Obj;
    signedDidDoc = await hypersignDid.signByClientSpec({
      didDocument: didDoc,
      clientSpec: "eth-personalSign",
      address: account,
      web3: web3Obj,
    });
    console.log(signedDidDoc);
  });
document
  .getElementById("registerByClientSpec")
  .addEventListener("click", async () => {
    const web3Obj = new Web3(window.web3.currentProvider);
    window.web3 = web3Obj;
    const hypersignDID2 = new HypersignDID({
      offlineSigner,
      nodeRpcEndpoint,
      nodeRestEndpoint,
      namespace: "testnet",
    });
    await hypersignDID2.init();

    const sigInfo = [
      {
        verification_method_id: didDoc.verificationMethod[0].id,
        signature: signedDidDoc.signature,
        clientSpec: { type: "eth-personalSign" },
      },
    ];
    const registeredDid = await hypersignDID2.registerByClientSpec({
      didDocument: signedDidDoc.didDocument,
      signInfos: sigInfo,
    });
    console.log(registeredDid, "registeredDid");
  });

document.getElementById("signAndReg").addEventListener("click", async () => {
  const hypersignDiD = new HypersignDID({
    offlineSigner,
    nodeRpcEndpoint,
    nodeRestEndpoint,
    namespace: "testnet",
  });
  await hypersignDiD.init();
  const web3Obj = new Web3(window.web3.currentProvider);
  window.web3 = web3Obj;
  const regDidDoc = await hypersignDiD.signAndRegisterByClientSpec({
    didDocument: didDoc,
    address: account,
    verificationMethodId: didDoc.verificationMethod[0].id,
    web3: web3Obj,
    clientSpec: "eth-personalSign",
  });
  console.log(regDidDoc, "regDidDoc");
});

document.getElementById("resolveDid").addEventListener("click", async () => {
  const hypersignDiD = new HypersignDID({
    offlineSigner,
    nodeRpcEndpoint,
    nodeRestEndpoint,
    namespace: "testnet",
  });
  await hypersignDiD.init();
  resolvedDidDoc = await hypersignDiD.resolve({
    did: didDoc.id,
    //ed25519verificationkey2020: false,
  });
  console.log(resolvedDidDoc);
});
document.getElementById("updateDid").addEventListener("click", async () => {
  console.log("update===================");
  const web3Obj = new Web3(window.web3.currentProvider);
  window.web3 = web3Obj;
  const did = didDoc.id;
  let verificationMethod2 = didDoc.verificationMethod[0].id;
  verificationMethod2 = verificationMethod2.replace("key-1", "key-2");
  didDoc.verificationMethod.push({
    id: verificationMethod2,
    type: "EcdsaSecp256k1RecoveryMethod2020",
    controller: did,
    blockchainAccountId: `eip155:56:${account}`,
  });
  didDoc.authentication.push(verificationMethod2);
  const hypersignDiD = new HypersignDID({
    offlineSigner,
    nodeRpcEndpoint,
    nodeRestEndpoint,
    namespace: "testnet",
  });
  await hypersignDiD.init();
  const signAndDoc = await hypersignDiD.signByClientSpec({
    didDocument: didDoc,
    clientSpec: "eth-personalSign",
    address: account,
    web3: web3Obj,
  });
  console.log(signAndDoc, "signAndDoc");
  const sigInfo = [
    {
      verification_method_id: didDoc.verificationMethod[0].id,
      signature: signAndDoc.signature,
      clientSpec: { type: "eth-personalSign" },
    },
    {
      verification_method_id: verificationMethod2,
      signature: signAndDoc.signature,
      clientSpec: { type: "eth-personalSign" },
    },
  ];
  const updateDID = await hypersignDiD.updateByClientSpec({
    didDocument: signAndDoc.didDocument,
    versionId: resolvedDidDoc.didDocumentMetadata.versionId,
    signInfos: sigInfo,
  });
  console.log(updateDID);
});

document.getElementById("deactivate").addEventListener("click", async () => {
  console.log("update===================");
  const web3Obj = new Web3(window.web3.currentProvider);
  window.web3 = web3Obj;
  const did = didDoc.id;
  let verificationMethod2 = didDoc.verificationMethod[0].id;
  verificationMethod2 = verificationMethod2.replace("key-1", "key-2");
  didDoc.verificationMethod.push({
    id: verificationMethod2,
    type: "EcdsaSecp256k1RecoveryMethod2020",
    controller: did,
    blockchainAccountId: `eip155:56:${account}`,
  });
  didDoc.authentication.push(verificationMethod2);
  const hypersignDiD = new HypersignDID({
    offlineSigner,
    nodeRpcEndpoint,
    nodeRestEndpoint,
    namespace: "testnet",
  });
  await hypersignDiD.init();
  const signAndDoc = await hypersignDiD.signByClientSpec({
    didDocument: didDoc,
    clientSpec: "eth-personalSign",
    address: account,
    web3: web3Obj,
  });
  console.log(signAndDoc, "signAndDoc");
  const sigInfo = [
    {
      verification_method_id: didDoc.verificationMethod[0].id,
      signature: signAndDoc.signature,
      clientSpec: { type: "eth-personalSign" },
    },
    {
      verification_method_id: verificationMethod2,
      signature: signAndDoc.signature,
      clientSpec: { type: "eth-personalSign" },
    },
  ];
  const updateDID = await hypersignDiD.deactivateByClientSpec({
    didDocument: signAndDoc.didDocument,
    versionId: resolvedDidDoc.didDocumentMetadata.versionId,
    signInfos: sigInfo,
  });
  console.log(updateDID);
});

// document.getElementById("createDID2").addEventListener("click", async () => {
//   offlineSigner = await createWallet(mnemonic);
// const hypersignDid = new HypersignDID({ namespace: "testnet" });
// const seed = Bip39.decode(mnemonic);
// const kp = await hypersignDid.generateKeys({ seed });
// privateKey = kp.privateKeyMultibase;
// const publicKey = kp.publicKeyMultibase;
//   console.log(privateKey, publicKey);
//   didDocument = await hypersignDid.generate({
//     publicKeyMultibase: privateKey,
//   });
//   console.log(didDocument);
//   // did = didDoc.id;
// });

// document.getElementById("regiDid2").addEventListener("click", async () => {
//   const hypersignDid = new HypersignDID({
//     offlineSigner,
//     nodeRestEndpoint,
//     nodeRpcEndpoint,
//     namespace: "testnet",
//   });
//   await hypersignDid.init();
//   console.log(privateKey);
//   const registerDid = await hypersignDid.register({
//     didDocument: didDocument,
//     privateKeyMultibase: privateKey,
//     verificationMethodId: didDocument.verificationMethod[0].id,
//   });
//   console.log(registerDid);
// });
document
  .getElementById("generateCredentail")
  .addEventListener("click", async () => {
    offlineSigner = await createWallet(mnemonic);
    const vc = new HypersignVerifiableCredential({
      offlineSigner,
      nodeRestEndpoint,
      nodeRpcEndpoint,
      namespace: "testnet",
    });
    await vc.init();
    credentialDoc = await vc.generate({
      schemaContext: ["https://schema.org"],
      type: ["Person"],
      subjectDid: did,
      issuerDid: issuerDid,
      fields: { name: "varsha" },
      expirationDate: "2027-12-10T18:30:00.000Z",
    });
    console.log(credentialDoc);
  });
document
  .getElementById("issueCredential")
  .addEventListener("click", async () => {
    const hypersignDid = new HypersignDID({ namespace: "testnet" });
    const seed = Bip39.decode(mnemonic);
    const kp = await hypersignDid.generateKeys({ seed });
    privateKey = kp.privateKeyMultibase;
    console.log(privateKey);
    const publicKey = kp.publicKeyMultibase;
    const hypersignCred = new HypersignVerifiableCredential({
      offlineSigner,
      nodeRpcEndpoint,
      nodeRestEndpoint,
      namespace: "testnet",
    });

    issueCredential = await hypersignCred.issue({
      credential: credentialDoc,
      issuerDid: issuerDid,
      verificationMethodId: `${issuerDid}#key-1`,
      privateKeyMultibase: privateKey,
    });
    console.log(issueCredential);
  });
document
  .getElementById("generatePresentation")
  .addEventListener("click", async () => {
    const hypersignPresentation = new HypersignVerifiablePresentation({
      offlineSigner,
      nodeRestEndpoint,
      nodeRpcEndpoint,
      namespace: "testnet",
    });
    const cred = issueCredential.signedCredential;
    const credArra = [];
    credArra.push(cred);
    presentation = await hypersignPresentation.generate({
      verifiableCredentials: credArra,
      holderDid: did,
    });
    console.log(presentation);
  });

document
  .getElementById("signPresentation")
  .addEventListener("click", async () => {
    const hypersignPresentation = new HypersignVerifiablePresentation({
      offlineSigner,
      nodeRestEndpoint,
      nodeRpcEndpoint,
      namespace: "testnet",
    });
    const web3Obj = new Web3(window.web3.currentProvider);
    window.web3 = web3Obj;
    signedPresentation = await hypersignPresentation.signByClientSpec({
      presentation,
      holderDid: did,
      verificationMethodId: `${did}#key-1`,
      web3Obj,
      challenge: "dhejglgk",
    });
    console.log(signedPresentation, "signedPresentation");
  });

document
  .getElementById("verifyPresentation")
  .addEventListener("click", async () => {
    const hypersignPresentation = new HypersignVerifiablePresentation({
      nodeRestEndpoint,
      nodeRpcEndpoint,
      namespace: "testnet",
    });
    const web3Obj = new Web3(window.web3.currentProvider);
    window.web3 = web3Obj;
    const verifiedPresentation = await hypersignPresentation.verifyByClientSpec(
      {
        signedPresentation,
        challenge: "dhejglgk",
        issuerDid: issuerDid,
        holderDid: did,
        holderVerificationMethodId: didDoc.verificationMethod[0].id,
        issuerVerificationMethodId: didDoc.verificationMethod[0].id,
        web3Obj,
      }
    );

    console.log(verifiedPresentation);
  });

// document.getElementById("registerDID").addEventListener("click", async () => {
//   const hypersignDID = new HypersignDID();
//   const web3Obj = new Web3(window.web3.currentProvider);
//   window.web3 = web3Obj;
//   console.log(account, web3Obj);

//   const signAndDoc = await hypersignDID.signByClientSpec({
//     didDocument: didDocument.didDocument,
//     clientSpec: "eth-personalSign",
//     address: account,
//     web3: web3Obj,
//   });
//   console.log(signAndDoc);

//   const didDoc = signAndDoc.didDocument;
//   console.log({ didDoc, signAndDoc });

//   const sigInfos = [
//     {
//       verification_method_id: didDoc.verificationMethod[0].id,
//       signature: signAndDoc.signature,
//       clientSpec: { type: "eth-personalSign" },
//     },
//   ];
//   let resp = await fetch(`${apiBaseUrl}/register`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Bearer " + accessToken,
//     },
//     body: JSON.stringify({
//       didDocument: didDoc,
//       signInfos: sigInfos,
//     }),
//   });

//   console.log(await resp.json());
// });

// document.getElementById("updateDID").addEventListener("click", async () => {
//   console.log("updateDid");
//   const hypersignDID = new HypersignDID();
// const web3Obj = new Web3(window.web3.currentProvider);
// window.web3 = web3Obj;
//   const did = didDocument.didDocument.id;
//   delete didDocument.service;
//   let verificationMethod2 = didDocument.didDocument.verificationMethod[0].id;
//   verificationMethod2 = verificationMethod2.replace("key-1", "key-2");
//   const verificationMetod3 = verificationMethod2.replace("key-2", "key-3");
//   console.log(verificationMethod2, "verificationMethod2");
//   console.log(didDocument.didDocument.verificationMethod);
//   didDocument.didDocument.assertionMethod.push(verificationMethod2);
//   didDocument.didDocument.authentication.push(verificationMethod2);
//   didDocument.didDocument.capabilityInvocation.push(verificationMethod2);

//   didDocument.didDocument.capabilityDelegation.push(verificationMethod2);

//   didDocument.didDocument.verificationMethod.push({
//     id: verificationMethod2,
//     type: "EcdsaSecp256k1RecoveryMethod2020",
//     controller: did,
//     blockchainAccountId: `eip155:137:${account}`,
//   });
//   // if wants to add three wallet

//   // didDocument.didDocument.assertionMethod.push(verificationMetod3);
//   // didDocument.didDocument.authentication.push(verificationMetod3);
//   // didDocument.didDocument.capabilityInvocation.push(verificationMetod3);

//   // didDocument.didDocument.capabilityDelegation.push(verificationMetod3);

// didDocument.didDocument.verificationMethod.push({
//   id: verificationMetod3,
//   type: "EcdsaSecp256k1RecoveryMethod2020",
//   controller: did,
//   blockchainAccountId: `eip155:56:${account}`,
// });
//   console.log(didDocument.didDocument);
// const signAndDoc = await hypersignDID.signByClientSpec({
//   didDocument: didDocument.didDocument,
//   clientSpec: "eth-personalSign",
//   address: account,
//   web3: web3Obj,
// });
//   console.log(signAndDoc, "signAndDoc");
//   const didDoc = signAndDoc.didDocument;
//   const signInfos = [
//     {
//       verification_method_id: didDoc.verificationMethod[0].id,
//       signature: signAndDoc.signature,
//       clientSpec: { type: "eth-personalSign", adr036SignerAddress: "" },
//     },
//     {
//       verification_method_id: verificationMethod2,
//       signature: signAndDoc.signature,
//       clientSpec: { type: "eth-personalSign", adr036SignerAddress: "" },
//     },
//     // {
//     //   verification_method_id: verificationMetod3,
//     //   signature: signAndDoc.signature,
//     //   clientSpec: { type: "eth-personalSign", adr036SignerAddress: "" },
//     // },
//   ];
//   console.log(signInfos);
//   console.log({
//     didDocument: didDoc,
//     signInfos: signInfos,
//   });
//   let resp = await fetch(`${apiBaseUrl}`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Bearer " + accessToken,
//     },
//     body: JSON.stringify({
//       didDocument: didDoc,
//       signInfos: signInfos,
//       deactivate: false,
//     }),
//   });

//   console.log(await resp.json());
// });
