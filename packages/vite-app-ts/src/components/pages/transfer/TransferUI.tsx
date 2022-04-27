import { List } from 'antd';
import { Address } from 'eth-components/ant';
import { FC } from 'react';

import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { useAppContracts } from '~~/components/contractContext';
import { useEthersContext } from 'eth-hooks/context';
import { useEventListener } from 'eth-hooks';

export interface ITransferUI {
  scaffoldAppProviders: IScaffoldAppProviders;
}

export const TransferUI: FC<ITransferUI> = (props) => {
  const ethersContext = useEthersContext();
  const yourContract = useAppContracts('YourCollectible', ethersContext.chainId);
  const [transferEvents] = useEventListener(yourContract, 'TransferSingle', 1);

  return (
    <>
      <div style={{ width: 600, margin: 'auto', marginTop: 32, paddingBottom: 32 }}>
        <List
          bordered
          dataSource={transferEvents}
          renderItem={(item: any) => {
            // console.log('item ', item);

            return (
              <List.Item>
                <span style={{ fontSize: 16, marginRight: 8 }}>#{item['blockNumber']}</span>
                <Address
                  address={item['args'][1]}
                  ensProvider={props.scaffoldAppProviders.mainnetAdaptor?.provider}
                  fontSize={16}
                />{' '}
                =&gt;
                <Address
                  address={item['args'][2]}
                  ensProvider={props.scaffoldAppProviders.mainnetAdaptor?.provider}
                  fontSize={16}
                />
                <span style={{ fontSize: 16, marginRight: 8 }}>Amount: {item['args'][4].toNumber()}</span>
              </List.Item>
            );
          }}
        />
      </div>
    </>
  );
};
export default TransferUI;
