import { useCallback, useEffect, useState } from "react";
import './index.css'
import classname from "classnames";
import { Reddem } from '../../../components/dialog/reddem'
import { useWorkspace } from "../../workspace";
import { config } from "../../utils/config";
interface NftData {
  nft_id: string;
  nft_name: string;
  nft_symbol: string;
  nft_img: string;
}
const collectionMint = config.collectionMint;

export default function HomePage() {
  const [tab, setTab] = useState(0)
  const [dialog, setDialog] = useState(false)
  const tabFn = (tabIndex: number) =>{
    setTab(tabIndex)
  }
  const dialogFn = (show: boolean) =>{
    setDialog(show)
  }
  const work = useWorkspace()
  const [list, setList] = useState<NftData[]>([]);
  const getData = useCallback(async () => {
    try {


      if( work ){
        const {
          connection,
          program,
          wallet,
          provider
        } = work;

        const ownerstring = wallet.publicKey.toString();
        if(tab){
          //staked nft
        }else{
          //my nft
          const url = config.heliusrpc;
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 'my-id',
              method: 'searchAssets',
              params: {
                ownerAddress: ownerstring,
                grouping: ['collection', collectionMint],
                page: 1,
                limit: 1000,
              },
            }),
          });

        const { result } = await response.json();
        console.log(result);
        if (result.total) {
            const newFilteredResults: NftData[] = result.items.map((nft: any) => {
            const nft_img = nft.content.links.image;
            //const nft_img = "https://ipfs.io/ipfs/QmfW5BtNQ5RBPmqDGzmXFktvhWs2aJKmeoAFZP7p7cuJ2K";
            const nft_id = nft.id;
            const nft_name = nft.content.metadata.name;
            const nft_symbol = nft.content.metadata.symbol;

            return {
              nft_id,
              nft_name,
              nft_symbol,
              nft_img
            };
          });

          setList(newFilteredResults);
        }
        }

      }

    }catch (error) {
      console.error('Failed to load data:', error);
    }
  },[work,tab]);
  useEffect(() => {
    getData();
  }, [getData]);
  return (
    <div className="grid-width">
      <div className="nft">
        <div className="nft-tab">
          <div onClick={() =>{
            tabFn(0)
          }} className={ classname({
            "nft-tab-item": true,
            "nft-tab-active": tab === 0
          }) }>Active</div>
          <div onClick={() =>{
            tabFn(1)
          }} className={ classname({
            "nft-tab-item": true,
            "nft-tab-active": tab === 1
          }) }>Past</div>
        </div>
        <div className="nft-list">
          {
             list.map((nft) =>(
              <div className="nft-list-item" key={nft.nft_id}>
                <img className="nft-list-thumb" src={nft.nft_img} alt={nft.nft_symbol} />
                <div className="nft-list-text">{nft.nft_name}</div>
                <div className="nft-list-text">{nft.nft_symbol}</div>
                <div onClick={(e) =>{
                  e.preventDefault()
                  dialogFn(true)
                }} className="nft-list-btn">extract</div>
              </div>
            ))
          }
        </div>
      </div>
      <div className="footer">
        <img className="footer-icon1" src="../../../assets/monery.png" alt="" />
        <img className="footer-icon2" src="../../../assets/kefu.png" alt="" />
      </div>
      {
        dialog &&
        <Reddem
          data={{
            d: '100',
            a: '1000',
            b: 'Redeem',
            c: 'Current staking LP',
            e: 'Current staking LP:',
            f: 'The current redemption amount:'
          }}
          onOk={() =>{
            dialogFn(false)
            console.log('ok')
          }}
          onCancel={() =>{
            dialogFn(false)
            console.log('关闭')
          }}/>
      }

    </div>
  )
}
