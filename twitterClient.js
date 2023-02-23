const { ethers } = require('ethers');
const { InfuraProvider } = require('@ethersproject/providers');
const { TwitterApi } = require('twitter-api-v2');
const Ratelimiter = require('ratelimiter');

// Load environment variables
require('dotenv').config();

// Load Infura project ID from environment variable
const infuraProjectId = process.env.INFURA_PROJECT_ID;

// Load Twitter API keys from environment variables
const twitterApiKey = process.env.API_KEY;
const twitterApiSecret = process.env.API_SECRET;
const twitterAccessToken = process.env.ACCESS_TOKEN;
const twitterAccessTokenSecret = process.env.ACCESS_SECRET;

// Connect to Ethereum network via Infura
const provider = new InfuraProvider('mainnet', infuraProjectId);

// Create a new instance of the Twitter client with your API keys
const client = new TwitterApi({
  apiKey: twitterApiKey,
  apiSecret: twitterApiSecret,
  accessToken: twitterAccessToken,
  accessTokenSecret: twitterAccessTokenSecret
});

// Array of NFT collection contract addresses to track
const collectionAddresses = [
  '0xd563272eea17F8CE929171c2bA62b1c7FB4756aE', // MGMiEditions (ERC 1155)
 // '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d', // Renaissauce
 // '0x495f947276749Ce646f68AC8c248420045cb7b5e' // Da Burning Bush
];

// Contract ABI for ERC-721 and ERC-1155 tokens
const erc721Abi = [
  'event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId)'
];
const erc1155Abi = [
  'event TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value)',
  'event TransferBatch(address indexed _operator, address indexed _from, address indexed _to, uint256[] _ids, uint256[] _values)'
];

// Format a sale event as a tweet text
function formatSale(sale) {
  const { collectionName, tokenId, seller, buyer, amount } = sale;
  const text = `🎉 SOLD 🎉\n\nToken: ${collectionName} #${tokenId}\nSeller: ${seller}\nBuyer: ${buyer}\nPrice: ${ethers.utils.formatEther(amount)} ETH\n\n#NFT #${collectionName} #${tokenId}`;
  return text;
}

// Function to get recent sales for a collection
async function getSalesForCollection(collectionAddress) {
  const contract = new ethers.Contract(collectionAddress, erc721Abi.concat(erc1155Abi), provider);
  const salesFilter = contract.filters.Transfer(null, null);
  const singleSalesFilter = contract.filters.TransferSingle(null, null, null, null, null);
  const batchSalesFilter = contract.filters.TransferBatch(null, null, null, null, null);
  const sales = await contract.queryFilter(salesFilter, -100); // Get last 100 sales
  const singleSales = await contract.queryFilter(singleSalesFilter, -100); // Get last 100 single sales
  const batchSales = await contract.queryFilter(batchSalesFilter, -100); // Get last 100 batch sales
  return [...sales, ...singleSales, ...batchSales].map((event) => {
    return {
      collectionName: event.address.toLowerCase() === '0xd563272eea17F8CE929171c2bA62b1c7FB4756aE'
    };
  });
}