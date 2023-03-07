import { ethers } from "ethers";
import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";
import path from "path";




dotenv.config({ path: path.join(new URL(import.meta.url).pathname, ".env") });

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const ACCESS_SECRET = process.env.ACCESS_SECRET;

const NFT_CONTRACT_ADDRESS = "0xd563272eea17F8CE929171c2bA62b1c7FB4756aE";
const NFT_TOKEN_ID = 1;
const NETWORK = "mainnet";
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;

const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}];
const provider = new ethers.InfuraProvider(NETWORK, INFURA_PROJECT_ID);
const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, abi, provider);

const twitterClient = new TwitterApi({
  appKey: API_KEY,
  appSecret: API_SECRET,
  accessToken: ACCESS_TOKEN,
  accessSecret: ACCESS_SECRET,
});

async function main() {
  try {
    const filter = {
      address: NFT_CONTRACT_ADDRESS,
      topics: [
        ethers.utils.id("Transfer(address,address,uint256)"),
        null,
        ethers.utils.hexZeroPad(ethers.BigNumber.from(NFT_TOKEN_ID).toHexString(), 32),
      ],
    };
    
    console.log(`Listening for sales of NFT with token ID ${NFT_TOKEN_ID}...`);
    
    contract.on(filter, async (from, to, tokenId, event) => {
      console.log(`NFT with token ID ${tokenId.toString()} was sold!`);
      
      const tweetText = `Just sold NFT ${NFT_TOKEN_ID}!`;
      
      const tweet = await twitterClient.v2.tweet(tweetText);
      console.log(`Tweeted: ${tweet.text}`);
    });
    
  } catch (error) {
    console.log(error);
  }
}

main();







