import { Button, Card, List } from 'antd';

import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';

import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { useAppContracts } from '~~/components/contractContext';
import { useEthersContext } from 'eth-hooks/context';

import ReactJson from 'react-json-view';

import { create } from 'ipfs-http-client';
const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
export interface IIPFSUploadUI {
  scaffoldAppProviders: IScaffoldAppProviders;
}
// EXAMPLE STARTING JSON:
const STARTING_JSON: object = {
  description: "It's actually a bison?",
  external_url: 'https://austingriffith.com/portfolio/paintings/', // <-- this can link to a page for the specific file too
  image: 'https://austingriffith.com/images/paintings/buffalo.jpg',
  name: 'Buffalo',
  attributes: [
    {
      trait_type: 'BackgroundColor',
      value: 'green',
    },
    {
      trait_type: 'Eyes',
      value: 'googly',
    },
  ],
};
export const IPFSUploadUI: FC<IIPFSUploadUI> = (props) => {
  const ethersContext = useEthersContext();
  const yourContract = useAppContracts('YourCollectible', ethersContext.chainId);
  const [yourJSON, setYourJSON] = useState(STARTING_JSON);
  const [sending, setSending] = useState<boolean>();
  const [ipfsHash, setIpfsHash] = useState<string>();
  console.log('IPFSUploadUI ');
  return (
    <>
      <div style={{ paddingTop: 32, width: 740, margin: 'auto', textAlign: 'left' }}>
        <ReactJson
          style={{ padding: 8 }}
          src={yourJSON}
          theme="pop"
          enableClipboard={false}
          onEdit={(edit) => {
            setYourJSON(edit.updated_src);
          }}
          onAdd={(add) => {
            setYourJSON(add.updated_src);
          }}
          onDelete={(del) => {
            setYourJSON(del.updated_src);
          }}
        />
      </div>

      <Button
        style={{ margin: 8 }}
        loading={sending}
        size="large"
        shape="round"
        type="primary"
        onClick={async () => {
          console.log('UPLOADING...', yourJSON);
          setSending(true);
          setIpfsHash('');
          const result = await ipfs.add(JSON.stringify(yourJSON)); // addToIPFS(JSON.stringify(yourJSON))
          if (result && result.path) {
            setIpfsHash(result.path);
          }
          setSending(false);
          console.log('RESULT:', result);
        }}>
        Upload to IPFS
      </Button>

      <div style={{ padding: 16, paddingBottom: 150 }}>{ipfsHash}</div>
    </>
  );
};
export default IPFSUploadUI;
