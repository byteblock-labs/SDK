'use strict';
const express = require("express");
const app = express();
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');
const channelName = 'mychannel';
const chaincodeName = 'ledger';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';
var contract;
function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

exports.startBc = async function main() {
//async function main() {
	try {
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg1);
		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
		const gateway = new Gateway();
		try {
			await gateway.connect(ccp, {wallet, identity: org1UserId, discovery: { enabled: true, asLocalhost: true}});
			const network = await gateway.getNetwork(channelName);
			contract = network.getContract(chaincodeName);
			console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');
		
		await contract.submitTransaction('InitLedger');
			console.log('*** Result: committed');
		} finally
		{
//                        gateway.disconnect();
                }
            } catch (error) {
                console.error(`******** FAILED to run the application: ${error}`);
            }
}

exports.getallstudentinfo = async function GetAllStudentInfo_ledger() {
	let result = await contract.evaluateTransaction('GetAllStudentInfo');
	console.log(`GetAllStudentInfo_ledger Result: ${prettyJSONString(result.toString())}`);
	return (result.toString());
}

exports.newenrollment = async function EnrollNewStudent_ledger(name, uni, visa, ticket, doc, fee) {
	
	const result = await contract.submitTransaction('EnrollNewStudent', name, uni, visa, ticket, doc, fee);
	console.log('EnrollNewStudent_ledger : Process issue transaction response.'+result);
	return (result);
}

exports.updateticket = async function UpdateTicketInfo_ledger(name, ticket) {
	console.log("UpdateTicketInfo_ledger : ", name, ticket);
	try {
	var result = 	await contract.submitTransaction('UpdateTicketInfo', name, ticket);
        console.log('UpdateTicketInfo_ledger : Process issue transaction response.'+result);
	return ("Success");
        } catch (initError) {
                console.log(`******** Error :: ${initError}`);
		return ("Failure");
        }
}

exports.updateuniinfo = async function UpdateUniversityInfo_ledger(name, uni) {
	console.log("UpdateUniversityInfo_ledger : ", name, uni);
        try {
	const result = await contract.submitTransaction('UpdateUniversityInfo',name, uni);
	console.log('UpdateUniversityInfo_ledger : Process issue transaction response.'+result);
        return ("Success");
        } catch (initError) {
                console.log(`******** Error :: ${initError}`);
                return ("Failure");
        }
}

exports.updatevisainfo = async function UpdateVisaInfo_ledger(name, visa) {
	console.log("UpdateVisaInfo_ledger : ", name, visa);
	try {
	const result = 	await contract.submitTransaction('UpdateVisaInfo', name, visa);
	console.log('UpdateVisaInfo_ledger : Process issue transaction response.'+result);
        return ("Success");
        } catch (initError) {
                console.log(`******** Error :: ${initError}`);
                return ("Failure");
        }
}

exports.updatedocinfo = async function UpdateDocInfo_ledger(name, doc) {
        console.log("UpdateDocInfo_ledger : ", name, doc);
	try {
	const result = 	await contract.submitTransaction('UpdateDocInfo', name, doc);
	console.log('UpdateDocInfo_ledger : Process issue transaction response.'+result);
        return ("Success");
        } catch (initError) {
                console.log(`******** Error :: ${initError}`);
                return ("Failure");
        }
}

exports.updatefeeinfo = async function UpdateFeeInfo_ledger(name, fee) {
	console.log("UpdateFeeInfo_ledger : ", name, fee);
	try {
	const result = 	await contract.submitTransaction('UpdateFeeInfo', name, fee);
	console.log('UpdateFeeInfo_ledger : Process issue transaction response.'+result);
        return ("Success");
        } catch (initError) {
                console.log(`******** Error :: ${initError}`);
                return ("Failure");
        }

}

async function StudentExists_ledger(name) {
	console.log("StudentExists_ledger : ", name);
        let result = await contract.evaluateTransaction('StudentExists',name);
	console.log(result.toString());
	return (result.toString());
}

exports.readstudent = async function ReadStudentInfo_ledger(name) {
	console.log("ReadStudentInfo_ledger : Name : ",name);
        let result = await contract.evaluateTransaction('ReadStudentInfo',name);
	console.log("ReadStudentInfo_ledger : Result : ",result.toString());
        return (result.toString());
}

exports.gethistory = async function GetHistory_ledger(name) {
	console.log("GetHistory_ledger : Name : ",name);
        let result = await contract.evaluateTransaction('GetAssetHistory', name);
        console.log(`GetHistory_ledger : Result: ${prettyJSONString(result.toString())}`);
	return (result.toString());
}
app.get('/StudentExists/:name',function(req, res) {
	console.log(req.params.name);
        let result = StudentExists_ledger(req.params.name);
        result.then(function(result_user) {
        res.send(result_user)});
});
