require("dotenv").config({ path: __dirname + "/.env" });

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const { TwitterApi } = require("twitter-api-v2");
const { ethers } = require("ethers");

const alchemyKey = process.env.ALCHEMY_KEY;
const infuraKey = process.env.INFURA_KEY;
const privateKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_KEY;
const twitterApiKey = process.env.TWITTER_API_KEY;
const twitterApiSecretKey = process.env.TWITTER_API_SECRET_KEY;
const twitterAccessToken = process.env.TWITTER_ACCESS_TOKEN;
const twitterAccessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

const web3 = createAlchemyWeb3(alchemyKey);

const provider = new ethers.providers.InfuraProvider("mainnet", infuraKey);
const signer = new ethers.Wallet(privateKey);
const address = publicKey;
const contractAbi = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId)"
];
const contractAddress = "0x...";
const contract = new ethers.Contract(contractAddress, contractAbi, provider);
const contractWithSigner = contract.connect(signer);

const twitterClient = new TwitterApi({
  appKey: twitterApiKey,
  appSecret: twitterApiSecretKey,
  accessToken: twitterAccessToken,
  accessSecret: twitterAccessTokenSecret,
});

const tweet = async (message) => {
  try {
    await twitterClient.v2.tweet(message);
    console.log("Tweeted:", message);
  } catch (e) {
    console.log("Error:", e);
  }
};

const handleSale = async (tokenId, buyer) => {
  try {
    const owner = await contract.ownerOf(tokenId);
    if (owner === address && buyer !== address) {
      const message = `NFT Sale Alert 🚨\n\nToken ID: ${tokenId}\nBuyer: ${buyer}\n\n#NFT #CryptoArt #${contractAddress}`;
      await tweet(message);
    }
  } catch (e) {
    console.log("Error:", e);
  }
};

contractWithSigner.on("Transfer", (from, to, tokenId) => {
  handleSale(tokenId, to);
});




