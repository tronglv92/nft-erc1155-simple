import '~~/styles/main-page.css';
import { GenericContract } from 'eth-components/ant/generic-contract';
import { useContractReader, useBalance, useEthersAdaptorFromProviderOrSigners, useEventListener } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useDexEthPrice } from 'eth-hooks/dapps';
import { asEthersAdaptor } from 'eth-hooks/functions';
import React, { FC, useEffect, useState } from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
import { NETWORKS } from 'scaffold-common/src/constants';

import { MainPageFooter, MainPageHeader, createPagesAndTabs, TContractPageList } from './components/main';
import { useScaffoldHooksExamples as useScaffoldHooksExamples } from './components/main/hooks/useScaffoldHooksExamples';

import { useAppContracts, useConnectAppContracts, useLoadAppContracts } from '~~/components/contractContext';
import { useBurnerFallback } from '~~/components/main/hooks/useBurnerFallback';
import { useScaffoldProviders as useScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { BURNER_FALLBACK_ENABLED, MAINNET_PROVIDER } from '~~/config/app.config';
import { Button, Card, List } from 'antd';
import { AddressInput } from 'eth-components/ant';
import YourCollectibles from './components/pages/yourCollectibles/YourCollectibles';
import TransferUI from './components/pages/transfer/TransferUI';
import IPFSUploadUI from './components/pages/ipfsUpload/ipfsUploadUI';

/**
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * See config/app.config.ts for configuration, such as TARGET_NETWORK
 * See appContracts.config.ts and externalContracts.config.ts to configure your contracts
 * See pageList variable below to configure your pages
 * See web3Modal.config.ts to configure the web3 modal
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 *
 * For more
 */

/**
 * The main component
 * @returns
 */
export const MainPage: FC = () => {
  const [yourCollectibles, setYourCollectibles] = useState<any>([]);
  // -----------------------------
  // Providers, signers & wallets
  // -----------------------------
  // 🛰 providers
  // see useLoadProviders.ts for everything to do with loading the right providers
  const scaffoldAppProviders = useScaffoldAppProviders();

  // 🦊 Get your web3 ethers context from current providers
  const ethersContext = useEthersContext();

  // if no user is found use a burner wallet on localhost as fallback if enabled
  useBurnerFallback(scaffoldAppProviders, BURNER_FALLBACK_ENABLED);

  // -----------------------------
  // Load Contracts
  // -----------------------------
  // 🛻 load contracts
  useLoadAppContracts();
  // 🏭 connect to contracts for mainnet network & signer
  const [mainnetAdaptor] = useEthersAdaptorFromProviderOrSigners(MAINNET_PROVIDER);
  useConnectAppContracts(mainnetAdaptor);
  // 🏭 connec to  contracts for current network & signer
  useConnectAppContracts(asEthersAdaptor(ethersContext));

  // -----------------------------
  // Hooks use and examples
  // -----------------------------
  // 🎉 Console logs & More hook examples:
  // 🚦 disable this hook to stop console logs
  // 🏹🏹🏹 go here to see how to use hooks!
  useScaffoldHooksExamples(scaffoldAppProviders);

  // -----------------------------
  // These are the contracts!
  // -----------------------------

  // init contracts
  const yourContract = useAppContracts('YourCollectible', ethersContext.chainId);
  const mainnetDai = useAppContracts('DAI', NETWORKS.mainnet.chainId);

  // keep track of a variable from the contract in the local React state:
  // const [purpose, update] = useContractReader(
  //   yourContract,
  //   yourContract?.purpose,
  //   [],
  //   yourContract?.filters.SetPurpose()
  // );

  // // 📟 Listen for broadcast events
  // const [setPurposeEvents] = useEventListener(yourContract, 'SetPurpose', 0);

  // -----------------------------
  // .... 🎇 End of examples
  // -----------------------------
  // 💵 This hook will get the price of ETH from 🦄 Uniswap:
  const [ethPrice] = useDexEthPrice(scaffoldAppProviders.mainnetAdaptor?.provider, scaffoldAppProviders.targetNetwork);

  // 💰 this hook will get your balance
  const [yourCurrentBalance] = useBalance(ethersContext.account);

  const [route, setRoute] = useState<string>('');
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  // -----------------------------
  // 📃 Page List
  // -----------------------------
  // This is the list of pages and tabs
  const pageList: TContractPageList = {
    mainPage: {
      name: 'YourCollectibles',
      element: <YourCollectibles scaffoldAppProviders={scaffoldAppProviders} />,
    },
    pages: [
      {
        name: 'Transfers',
        element: <TransferUI scaffoldAppProviders={scaffoldAppProviders} />,
      },
      {
        name: 'IpfsUpload',
        element: <IPFSUploadUI scaffoldAppProviders={scaffoldAppProviders} />,
      },
      {
        name: 'IpfsDownload',
        element: <IPFSUploadUI scaffoldAppProviders={scaffoldAppProviders} />,
      },
      {
        name: 'Debug',
        element: (
          <GenericContract
            contractName="YourCollectible"
            contract={yourContract}
            mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
            blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
          />
        ),
      },
    ],
  };
  const { pageElements, menuElement } = createPagesAndTabs(pageList, route, setRoute);

  return (
    <div className="App">
      <MainPageHeader scaffoldAppProviders={scaffoldAppProviders} price={ethPrice} />
      {/* Routes should be added between the <Switch> </Switch> as seen below */}
      <BrowserRouter>
        {menuElement}
        <Switch>
          {pageElements}
          {/* Subgraph also disabled in MainPageMenu, it does not work, see github issue https://github.com/scaffold-eth/scaffold-eth-typescript/issues/48! */}
          {/*
          <Route path="/subgraph">
            <Subgraph subgraphUri={subgraphUri} mainnetProvider={scaffoldAppProviders.mainnetAdaptor?.provider} />
          </Route>
          */}
        </Switch>
      </BrowserRouter>

      <MainPageFooter scaffoldAppProviders={scaffoldAppProviders} price={ethPrice} />
    </div>
  );
};
