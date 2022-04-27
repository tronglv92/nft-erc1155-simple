import { Button, Card, List } from 'antd';
import { AddressInput } from 'eth-components/ant';
import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import { TEthersProvider } from 'eth-hooks/models';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { useAppContracts, useConnectAppContracts, useLoadAppContracts } from '~~/components/contractContext';
import { useEthersContext } from 'eth-hooks/context';
import { useContractReader, useBalance } from 'eth-hooks';
import { mergeDefaultUpdateOptions } from 'eth-hooks/functions';
import axios from 'axios';
export interface IYourCollectibles {
  scaffoldAppProviders: IScaffoldAppProviders;
}
const getFromIPFS = async (hashToGet: string) => {
  const meta = await axios.get(hashToGet);
  console.log('meta ', meta.data);
  return meta.data;
};
export const YourCollectibles: FC<IYourCollectibles> = (props) => {
  const [yourCollectibles, setYourCollectibles] = useState<any>([]);
  const [transferToAddresses, setTransferToAddresses] = useState<Record<string, string | undefined>>({});

  const ethersContext = useEthersContext();
  const signer = props.scaffoldAppProviders.localAdaptor?.signer;
  const settingsContext = useContext(EthComponentsSettingsContext);
  const yourContract = useAppContracts('YourCollectible', ethersContext.chainId);
  const tx = transactor(settingsContext, signer, undefined, undefined, true);
  const address = ethersContext.account;
  console.log('address ', address);
  const [collectiblesCount] = useContractReader(yourContract, yourContract?.getCurrentTokenID);
  const numberCollectiblesCount = collectiblesCount && collectiblesCount.toBigInt();

  const mainnetAdaptor = props.scaffoldAppProviders.mainnetAdaptor;
  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const [yourLocalBalance] = useBalance(ethersContext.account);
  // Just plug in different 🛰 providers to get your balance on different chains:
  const [yourMainnetBalance, yUpdate, yStatus] = useBalance(ethersContext.account, mergeDefaultUpdateOptions(), {
    adaptorEnabled: true,
    adaptor: mainnetAdaptor,
  });

  // console.log('yourLocalBalance ', yourLocalBalance.toString());
  // console.log('yourMainnetBalance ', yourMainnetBalance.toBigInt().toString());
  useEffect(() => {
    const updateCollectibles = async () => {
      const collectiblesUpdate = [];

      if (numberCollectiblesCount && address) {
        for (let collectibleIndex = 0; collectibleIndex < numberCollectiblesCount; collectibleIndex++) {
          try {
            let tokenSupply = await yourContract?.tokenSupply(collectibleIndex);
            let owned = await yourContract?.balanceOf(address, collectibleIndex);

            let ipfsHash = await yourContract?.uri(collectibleIndex); //All tokens have the same base uri
            console.log('ipfsHash ', ipfsHash);
            // const ipfsHash = uri?.replace(/{(.*?)}/, collectibleIndex.toString());
            // const ipfsHash = uri?.replace('https://ipfs.io/ipfs/', '');
            if (ipfsHash) {
              const jsonManifest = await getFromIPFS(ipfsHash);
              collectiblesUpdate.push({
                id: collectibleIndex,
                supply: tokenSupply,
                owned: owned,
                name: jsonManifest.name,
                description: jsonManifest.description,
                image: jsonManifest.image,
              });
            }
          } catch (e) {
            console.log(e);
          }
        }
        console.log('collectiblesUpdate ', collectiblesUpdate);
        setYourCollectibles(collectiblesUpdate);
      }
    };
    updateCollectibles();
  }, [numberCollectiblesCount, yourLocalBalance]);

  return (
    <>
      <div style={{ width: 640, margin: 'auto', marginTop: 32, paddingBottom: 32 }}>
        <List
          bordered
          dataSource={yourCollectibles ?? []}
          renderItem={(item: any) => {
            const id = item.id;
            return (
              <List.Item key={id + '_' + item.uri + '_' + item.owner}>
                <Card
                  title={
                    <div>
                      <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                    </div>
                  }>
                  <div>
                    <img src={item.image} style={{ maxWidth: 150 }} />
                  </div>
                  <div>{item.description}</div>
                </Card>

                <div>
                  owned: {item.owned.toNumber()} of {item.supply.toNumber()}
                  <AddressInput
                    ensProvider={props.scaffoldAppProviders.mainnetAdaptor?.provider}
                    placeholder="transfer to address"
                    address={transferToAddresses[id]}
                    onChange={(newValue) => {
                      const update: Record<string, string> = {};
                      update[id] = newValue.toString();
                      setTransferToAddresses({ ...transferToAddresses, ...update });
                    }}
                  />
                  <Button
                    onClick={() => {
                      const toAddress = transferToAddresses[id];
                      if (tx && yourContract && address && toAddress) {
                        tx(yourContract?.safeTransferFrom(address, toAddress, id, 1, []))
                          .then(() => {})
                          .catch(() => {});
                      }
                    }}>
                    Transfer
                  </Button>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </>
  );
};
export default YourCollectibles;
