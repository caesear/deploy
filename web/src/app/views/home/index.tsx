import { useEffect ,useCallback,useState} from "react";
import { Link } from 'react-router-dom';
import './index.css'
import { useWorkspace } from "../../workspace";
import { safeDivide } from "../../utils/bignum";
import { config } from "../../utils/config"
import { Success, Error, Close } from '../../../components/dialog/message'
import {
  PublicKey,
  Connection,
  LAMPORTS_PER_SOL,
  SYSVAR_RENT_PUBKEY,
  SystemProgram
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { BN } from "bn.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID ,associatedAddress} from "@coral-xyz/anchor/dist/cjs/utils/token";
import IPFS from 'ipfs'
interface NftData {
  nft_id: string;
  nft_name: string;
  nft_symbol: string;
  nft_img: string;
  priceUi:string;
}

interface CollectionData {
  supply: string;
  totalMinted: string;
  price: string;
}

export default function HomePage() {
  const work = useWorkspace()
  const [ showSuccess, setShowSuccess ] = useState(false)
  const [ showError, setShowError ] = useState(false)
  const [ showClose, setShowClose ] = useState(false)

  const [list, setList] = useState<NftData[]>([]);
  const [collection, setCollection ]= useState<CollectionData>();

  const collectionMint = config.collectionMint;
  const metadata_program_address = config.metadata_program_address;
  const fee_recipient_address = config.fee_recipient_address;

  const showToastSuccess = () =>{
    setShowSuccess(true)
    setTimeout(() =>{
      setShowSuccess(false)
    },2000)
  }
  const showToastError = () =>{
    setShowError(true)
    setTimeout(() =>{
      setShowError(false)
    },2000)
  }
  const showToastClose = () =>{
    setShowClose(true)
    setTimeout(() =>{
      setShowClose(false)
    },2000)
  }

  const getData = useCallback(async () => {
    try {


      if( work ){
        //console.log(1,work.wallet);
        const {
          connection,
          program,
          wallet,
          provider
        } = work;

        //获取价格 总质押量和总供应量

        const collectionPDA = new PublicKey(collectionMint);
        const cardInfo = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("card"), collectionPDA.toBytes()],program.programId)[0];
        //console.log(cardInfo);
        const data = await program.account.cardInfo.fetch(cardInfo);

        const newredResults: CollectionData = {
          supply: data.supply.toString(),
          totalMinted: data.totalMinted.toString(),
          price: data.price.toString()
        };
        setCollection(newredResults);
        // console.log("supply",data.supply);
        // console.log("totalMinted",data.totalMinted.toString());
        // console.log("price",data.price.toString());
        const price = data.price.toString();
        const lamportsPerSolString: string = LAMPORTS_PER_SOL.toString();  // 转换为字符串
        const priceUi = safeDivide(price,lamportsPerSolString).toString();
        //console.log("priceUi",priceUi);
      //const ownerstring = provider.wallet.publicKey.toBase58();
      //const ownerkey = provider.wallet.publicKey;
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
            //ownerAddress: ownerstring,
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
            nft_img,
            priceUi
          };
        });

        setList(newFilteredResults);
      }
      }
    }catch (error) {
      console.error('Failed to load data:', error);
    }
  },[work]);

  const handleMintClick = () => {
    if(work){
       mintNftBuilder();
    }
  };

  const mintNftBuilder = async () => {


    const {
      connection,
      program,
      //wallet,
      provider
    } = work;

    let price = '';
    if (collection) {
      price = collection.price;
      console.log("Price:", price);

    } else {
      console.error("Collection data is not available.");
    }
    const user = provider.wallet.publicKey;
    const timestamp = Math.floor(Date.now() / 1000);
    const timestampBN = new BN(timestamp);

    const ticket = anchor.web3.PublicKey.findProgramAddressSync([timestampBN.toArrayLike(Buffer, 'le', 8)], program.programId)[0];
    const isPreSale = true;
    const mint = anchor.web3.Keypair.generate();

    console.log("ticket", ticket.toBase58());

    const nftName = "zo"; // replace with real nft name
    const symbol = "zo"; // replace with real symbol
    const uri = "https://ipfs.io/ipfs/bafkreib6du5iyxxm3qvmzmcyl6k4jnshkuw4rtkd2on7jho4g7j6flq7wa"; // replace with real uri



    const collectionPDA = new PublicKey(collectionMint); // replace with the real collectionPDA address
    const METADATA_PROGRAM = new PublicKey(metadata_program_address);
    const feeRecipient = new PublicKey(fee_recipient_address); // replace with the real feeRecipient address

    const metadataPDA = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), METADATA_PROGRAM.toBytes(), mint.publicKey.toBytes()],
        METADATA_PROGRAM
    )[0];

    const masterEditionPDA = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), METADATA_PROGRAM.toBytes(), mint.publicKey.toBytes(), Buffer.from("edition")],
        METADATA_PROGRAM
    )[0];

    const tokenAccount = associatedAddress({
        mint: mint.publicKey,
        owner: provider.wallet.publicKey
    });

    const collectionMetadataPDA = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), METADATA_PROGRAM.toBytes(), collectionPDA.toBytes()],
        METADATA_PROGRAM
    )[0];

    const collectionMasterEditionPDA = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), METADATA_PROGRAM.toBytes(), collectionPDA.toBytes(), Buffer.from("edition")], METADATA_PROGRAM
    )[0];

    const modifyComputeUnits = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 });

    const perfIns = [];
    perfIns.push(modifyComputeUnits);


    // const userInfo = anchor.web3.PublicKey.findProgramAddressSync([user.toBytes(), collectionPDA.toBytes()],
    //     program.programId)[0];

    const cardInfo = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("card"), collectionPDA.toBytes()],
        program.programId)[0];

    const solLamports = await connection.getBalance(user, 'confirmed');


    // replace with real price
    if (solLamports < Number(price)) {
        console.log('error', '余额不足');
    } else {
        try {
            const tx = await program.methods.createItem({
                    name: nftName,
                    symbol: symbol,
                    uri: uri,
                    timestamp: new BN(timestamp),
                    isPreSale: isPreSale,
                })
                .accounts({
                    user: user,
                    cardInfo: cardInfo,
                    collectionMint: collectionPDA,
                    collectionMetadataAccount: collectionMetadataPDA,
                    collectionMasterEdition: collectionMasterEditionPDA,
                    nftMint: mint.publicKey,
                    metadataAccount: metadataPDA,
                    masterEdition: masterEditionPDA,
                    tokenAccount: tokenAccount,
                    feeRecipient: feeRecipient,
                    ticket: ticket,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
                    tokenMetadataProgram: METADATA_PROGRAM,
                    rent: SYSVAR_RENT_PUBKEY,
                })
                .preInstructions([modifyComputeUnits])
                .signers([mint])
                .rpc();

            console.log("Your transaction signature", tx);
          showToastSuccess()
        } catch (error) {
            if (error instanceof anchor.AnchorError) {
                const code = error.error.errorCode.code;
                const number = error.error.errorCode.number;
                const message = error.error.errorMessage;
                showToastError()
                console.error('捕获到的错误:', code, number, message);
            } else {
                showToastError()
                console.error('未知错误:', error);
            }
        }
    }
};
  useEffect(() => {
    getData();
  }, [getData]);

  // if (!list.length) return null;
  return (
    <>
      <div className="banner">
        <div className="h4">Mint your Melic NFT</div>
        <div className="h5">
          <p>Be among the first minters</p>
        </div>
        <div className="text">
          <p>Encounter the mysterious Gobi bear on the Mongolian plains</p>
          <p>Solana's pioneering NFT merging real-world assets and tokenairdrops, unlimited potential</p>
          <p>Total supply of 5000, with 2500 whitelist and 2500 Fair Mint</p>
        </div>
        <div className="h5">
          <p>Minting price: 2.2 SOL</p>
        </div>
        <div className="btn-mint" onClick={handleMintClick}>Mint</div>
      </div>
      <div className="grid-width">
        {/* <div className="h6">The possibilities are endless</div> */}
        <img className="h5-icon" src="../../../assets/h5.png" alt="" />
        <div className="swiper">
          <div className="swiper-wrap">
            {
              list.map((nft) =>(
                <div  key={nft.nft_id} className="swiper-item">
                  <div className="swiper-item-wrap">
                    <div className="swiper-item-box">
                    <img className="swiper-item-icon" src={nft.nft_img} alt={nft.nft_symbol} />
                      <div className="swiper-item-footer">
                        <p className="swiper-item-name">{nft.nft_name}</p>
                        <p className="swiper-item-text">Floor price:{nft.priceUi}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>

        </div>
        <div className="card">
          <img src="../../../assets/qiu.png" className="card-qiu" alt="" />
          <div className="card-btn">
            <Link to="/lp">
              <div className="card-btn-primary">LP staking</div>
            </Link>
            <Link to="/nft">
              <div className="card-btn-primary">NFT staking</div>
            </Link>
          </div>
          <div className="card-overview">OVERVIEW</div>
          {/* <div className="card-dl">
            <div className="card-dt">4572</div>
            <div className="card-dd">Leaderboard</div>
            <div className="card-bar"></div>
          </div> */}
          <div className="card-dl">
            <div className="card-dt">{collection?.totalMinted}</div>
            <div className="card-dd">Minted</div>
            <div className="card-bar"></div>
          </div>
          <div className="card-dl">
            <div className="card-dt">{collection?.supply}</div>
            <div className="card-dd">Total supply</div>
          </div>
        </div>
      </div>



      {
        showSuccess && <Success/>
      }
      {
        showError && <Error/>
      }
      {
        showClose && <Close onCancel={() =>{
          setShowClose(false)
        }}/>
      }

    </>
  )
}
