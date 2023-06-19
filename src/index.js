let account;
let chainId;
let didDocument;
const apiBaseUrl = "http://localhost:3001/api/v1/did";
const accessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjA5OTAzZjk3MmMxZDg2ODIxNDY2MTZjNzAxYjVjZTYxOWY0NyIsInVzZXJJZCI6InZhcnNoYWt1bWFyaTM3MEBnbWFpbC5jb20iLCJncmFudFR5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJpYXQiOjE2ODY4OTExNjUsImV4cCI6MTY4NjkwNTU2NX0.PBWSFRwQuvrXXqJh1MiTrXBcAlsn3qWEDK3uvcuSDek";
const { HypersignDID } = require("hs-ssi-sdk");
const Web3 = require("web3");
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

document.getElementById("createDID").addEventListener("click", async () => {
  let resp = await fetch(`${apiBaseUrl}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
    body: JSON.stringify({
      namespace: "testnet",
      options: {
        keyType: "EcdsaSecp256k1RecoveryMethod2020",
        chainId,
        walletAddress: account,
      },
    }),
  });

  const didDoc = await resp.json();
  console.log(didDoc);
  didDocument = didDoc.metaData;
  document.getElementById("didId").innerHTML = didDoc.did;
  document.getElementById("didDoc").innerHTML = JSON.stringify(
    didDoc.metaData,
    null,
    2
  );
  console.log(didDocument);
});

document.getElementById("registerDID").addEventListener("click", async () => {
  const hypersignDID = new HypersignDID();
  const web3Obj = new Web3(window.web3.currentProvider);
  window.web3 = web3Obj;
  console.log(account, web3Obj);
  const signAndDoc = await hypersignDID.signByClientSpec({
    didDocument: didDocument.didDocument,
    clientSpec: "eth-personalSign",
    address: account,
    web3: web3Obj,
  });

  console.log(signAndDoc);

  const didDoc = signAndDoc.didDocument;
  console.log({ didDoc, signAndDoc });

  const sigInfos = [
    {
      verification_method_id: didDoc.verificationMethod[0].id,
      signature: signAndDoc.signature,
      clientSpec: { type: "eth-personalSign" },
    },
  ];
  let resp = await fetch(`${apiBaseUrl}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
    body: JSON.stringify({
      didDocument: didDoc,
      signInfos: sigInfos,
    }),
  });

  console.log(await resp.json());
});

document.getElementById("updateDID").addEventListener("click", async () => {
  console.log("updateDid");
  const hypersignDID = new HypersignDID();
  const web3Obj = new Web3(window.web3.currentProvider);
  window.web3 = web3Obj;
  const did = didDocument.didDocument.id;
  delete didDocument.service;
  let verificationMethod2 = didDocument.didDocument.verificationMethod[0].id;
  verificationMethod2 = verificationMethod2.replace("key-1", "key-2");
  const verificationMetod3 = verificationMethod2.replace("key-2", "key-3");
  console.log(verificationMethod2, "verificationMethod2");
  console.log(didDocument.didDocument.verificationMethod);
  didDocument.didDocument.assertionMethod.push(verificationMethod2);
  didDocument.didDocument.authentication.push(verificationMethod2);
  didDocument.didDocument.capabilityInvocation.push(verificationMethod2);

  didDocument.didDocument.capabilityDelegation.push(verificationMethod2);

  didDocument.didDocument.verificationMethod.push({
    id: verificationMethod2,
    type: "EcdsaSecp256k1RecoveryMethod2020",
    controller: did,
    blockchainAccountId: `eip155:137:${account}`,
  });
  // if wants to add three wallet

  // didDocument.didDocument.assertionMethod.push(verificationMetod3);
  // didDocument.didDocument.authentication.push(verificationMetod3);
  // didDocument.didDocument.capabilityInvocation.push(verificationMetod3);

  // didDocument.didDocument.capabilityDelegation.push(verificationMetod3);

  // didDocument.didDocument.verificationMethod.push({
  //   id: verificationMetod3,
  //   type: "EcdsaSecp256k1RecoveryMethod2020",
  //   controller: did,
  //   blockchainAccountId: `eip155:56:${account}`,
  // });
  console.log(didDocument.didDocument);
  const signAndDoc = await hypersignDID.signByClientSpec({
    didDocument: didDocument.didDocument,
    clientSpec: "eth-personalSign",
    address: account,
    web3: web3Obj,
  });
  console.log(signAndDoc, "signAndDoc");
  const didDoc = signAndDoc.didDocument;
  const signInfos = [
    {
      verification_method_id: didDoc.verificationMethod[0].id,
      signature: signAndDoc.signature,
      clientSpec: { type: "eth-personalSign", adr036SignerAddress: "" },
    },
    {
      verification_method_id: verificationMethod2,
      signature: signAndDoc.signature,
      clientSpec: { type: "eth-personalSign", adr036SignerAddress: "" },
    },
    // {
    //   verification_method_id: verificationMetod3,
    //   signature: signAndDoc.signature,
    //   clientSpec: { type: "eth-personalSign", adr036SignerAddress: "" },
    // },
  ];
  console.log(signInfos);
  console.log({
    didDocument: didDoc,
    signInfos: signInfos,
  });
  let resp = await fetch(`${apiBaseUrl}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
    body: JSON.stringify({
      didDocument: didDoc,
      signInfos: signInfos,
      deactivate: false,
    }),
  });

  console.log(await resp.json());
});
document.getElementById("fetchDid").addEventListener("click", async () => {
  console.log("fetchDid");

  const hypersignDID = new HypersignDID();
  const web3Obj = new Web3(window.web3.currentProvider);

  window.web3 = web3Obj;
  didDocument.didDocument.verificationMethod.push({
    id: "did:hid:testnet:0x2325a41Ef8b8f99CF00FAB50e05a6Ef438D21349#key-1",
    type: "EcdsaSecp256k1RecoveryMethod2020",
    controller: "did:hid:testnet:0x2325a41Ef8b8f99CF00FAB50e05a6Ef438D21349",
    blockchainAccountId: "eip155:1:0x2325a41Ef8b8f99CF00FAB50e05a6Ef438D21349",
  });
  const signAndDoc = await hypersignDID.signByClientSpec({
    didDocument: didDocument.didDocument,
    clientSpec: "eth-personalSign",
    address: account,
    web3: web3Obj,
  });
  console.log(signAndDoc);
  const didDoc = signAndDoc.didDocument;
  let resp = await fetch(`${apiBaseUrl}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
  });

  console.log(await resp.json());
});

document.getElementById("removeVM").addEventListener("click", async () => {
  console.log("rMV");
  const hypersignDID = new HypersignDID();
  const web3Obj = new Web3(window.web3.currentProvider);
  window.web3 = web3Obj;
  const did = didDocument.didDocument.id;
  didDocument.didDocument.verificationMethod.pop();
  didDocument.didDocument.assertionMethod.pop();
  didDocument.didDocument.authentication.pop();
  didDocument.didDocument.capabilityInvocation.pop();
  didDocument.didDocument.capabilityDelegation.pop();
  const signAndDoc = await hypersignDID.signByClientSpec({
    didDocument: didDocument.didDocument,
    clientSpec: "eth-personalSign",
    address: account,
    web3: web3Obj,
  });
  console.log(signAndDoc);
  const didDoc = signAndDoc.didDocument;
  const signInfos = [
    {
      verification_method_id: didDoc.verificationMethod[0].id,
      signature: signAndDoc.signature,
      clientSpec: { type: "eth-personalSign", adr036SignerAddress: "" },
    },
  ];
  let resp = await fetch(`${apiBaseUrl}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
    body: JSON.stringify({
      didDocument: didDoc,
      signInfos: signInfos,
      deactivate: false,
    }),
  });
  console.log(resp, "resp rvm");
});
