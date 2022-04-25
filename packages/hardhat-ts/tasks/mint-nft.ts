import { YourCollectible__factory } from 'generated/contract-types/factories/YourCollectible__factory';
import { YourCollectible } from 'generated/contract-types/YourCollectible';
import { task } from 'hardhat/config';
import { globSource, create } from 'ipfs-http-client';
import { getHardhatSigners } from 'tasks/functions/accounts';
import { sleep } from 'tasks/functions/utils';

task('mint', 'Mints NFTs to the specified address')
  .addPositionalParam('toAddress', 'The address that will mint them')
  .addOptionalPositionalParam('contractAddress', 'The address of contract them')
  .setAction(async ({ toAddress, contractAddress }: { toAddress: string; contractAddress?: string }, hre) => {
    const ipfs = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
    });

    // // // // // // // // // // // // // // // // // //

    console.log('\n\n 🎫 Minting to ' + toAddress + '...\n');

    const { deployer } = await getHardhatSigners(hre);
    let yourNFTContract: YourCollectible | undefined = undefined;

    if (contractAddress != null) {
      try {
        yourNFTContract = YourCollectible__factory.connect(contractAddress, deployer);
      } catch (e) {
        console.log('Invalid contractAddress, creating new YourNFT contract');
        return;
      }
    }

    if (yourNFTContract == null) {
      const factory = new YourCollectible__factory(deployer);
      yourNFTContract = await factory.deploy();
      console.log('\n\n 🎫 YourNFT contract deployed at ' + yourNFTContract.address + '\n');
    }

    if (yourNFTContract == null) {
      console.error('Could not get contract or create contract');
      return;
    }
    const delay = 1000;

    const tokenUris = [];
    const stream = globSource('./erc1155metadata', '**/*');
    for await (const file of ipfs.addAll(stream)) {
      const tokenUri = 'https://ipfs.io/ipfs/' + file.cid.toString();
      tokenUris.push(tokenUri);
    }
    await sleep(delay);

    await sleep(delay);

    console.log('Transferring Ownership of YourCollectible to ' + toAddress + '...');

    await yourNFTContract.transferOwnership(toAddress, { gasLimit: 400000 });

    await sleep(delay);

    /*


  console.log("Minting zebra...")
  await yourCollectible.mintItem("0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1","zebra.jpg")

  */

    // const secondContract = await deploy("SecondContract")

    // const exampleToken = await deploy("ExampleToken")
    // const examplePriceOracle = await deploy("ExamplePriceOracle")
    // const smartContractWallet = await deploy("SmartContractWallet",[exampleToken.address,examplePriceOracle.address])

    /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

    /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

    /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */
  });
