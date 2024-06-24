import { useCallback, useEffect, useState } from "react";
import './index.css'
import classname from "classnames";
import { Box1, Box2 } from '../../../components/dialog/reddem';
import { useWorkspace } from "../../workspace";
import { PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from "@solana/web3.js";
import { config } from "../../utils/config"
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID, associatedAddress } from "@coral-xyz/anchor/dist/cjs/utils/token";
import BN from "bn.js";
import { AnchorError } from "@coral-xyz/anchor/dist/cjs/error";
import { safeDivide, safeMultiply } from "../../utils/bignum";

interface StakeData {
  tokenStaked: string;
}

interface PoolData {
  tokenStaked: string;
}

interface EarnData {
  num: string;
}

export default function HomePage() {
  const [ showbox1, setShowbox1 ] = useState(false);
  //const [ showbox2, setShowbox2 ] = useState(false);
  const [stakeAmount, setStakeAmount] = useState<string>(''); // Stake amount state

  const toggleBox1 = (show: boolean) => {
    if(work){
      view();
    }
    setShowbox1(show);
  };

  const stakeSumbit = () => {
    if(work){
      stakeToken();
    }
  };

  const redeemSumbit= () => {
    if(work){
      unStakeToken();
    }
  };

  const withdrewSumbit= () => {
    if(work){
      withdrew();
    }
  };

  const work = useWorkspace();
  const [stake, setStake] = useState<StakeData | null>(null);
  const [pool, setPool] = useState<PoolData | null>(null);
  const [earn, setEarn] = useState<EarnData | null>(null);

  const getData = useCallback(async () => {
    try {
      if (work) {
        const { program, provider } = work;
        const user = provider.wallet.publicKey;
        const pledge_user = PublicKey.findProgramAddressSync([user.toBuffer()], program.programId)[0];

        const stakeInfoAccounts = await program.account.pledgeUser.fetch(pledge_user);
        console.log("stakeInfoAccounts", stakeInfoAccounts);
        if (stakeInfoAccounts) {

          const useamount = safeDivide(stakeInfoAccounts.tokenAmount.toString(),config.decimals)
          const newredResults: StakeData = {
            tokenStaked: useamount.toString(),
          };
          setStake(newredResults);
        } else {
          const newredResults: StakeData = { tokenStaked: "0" };
          setStake(newredResults);
        }

        const pledge_pool = PublicKey.findProgramAddressSync([Buffer.from("pledge_pool")], program.programId)[0];
        const totalAccounts = await program.account.pledgePool.fetch(pledge_pool);
        console.log("totalAccounts", totalAccounts);
        const poolamount = safeDivide(totalAccounts.tokenStaked.toString(),config.decimals)
        const poolResults: PoolData = { tokenStaked: poolamount.toString() };
        setPool(poolResults);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, [work]);

  useEffect(() => {
    getData();
  }, [getData]);

  const stakeToken = async () => {
    const { program, provider,connection } = work;

    //console.log("Staking amount:", stakeAmount);
    // 添加你的质押逻辑
    const mint = new PublicKey(config.lpToken);//lptoken
          let amountValue = Number(stakeAmount);
         //判断代币是否存在
         try {

          const pay = await connection.getParsedAccountInfo(mint);

            const tokenData = pay.value.data.parsed.info;

            if(!tokenData.isInitialized){
              console.error('代币未初始化');
            }
            amountValue = amountValue * Math.pow(10, tokenData.decimals);
            const owner = provider.wallet.publicKey;
            console.log(tokenData);
            const userVault = associatedAddress({
                mint: mint,
                owner: owner
              });
              //console.log(userVault);

              const findAccountARes = await connection.getTokenAccountBalance(userVault);

              const findAccountValue = findAccountARes.value.amount;
              const intValue = parseInt(findAccountValue, 10);
              console.log(intValue)
              if(intValue<amountValue){
                console.error('余额不足');
              }

        } catch (error) {
          console.error('你还没有此代币');
        }

        const user = provider.wallet.publicKey;
        const lp_pool = PublicKey.findProgramAddressSync([Buffer.from("lp_pool"), mint.toBuffer()], program.programId)[0];//用户质押池
        const pledge_pool = PublicKey.findProgramAddressSync([Buffer.from("pledge_pool")], program.programId)[0];//质押池
        const pledge_user = PublicKey.findProgramAddressSync([user.toBuffer()], program.programId)[0];//用户质押地址
        const pledge_amount = new BN(amountValue);//100 token 质押数量

        const user_token =  associatedAddress({
          mint: mint,
          owner: user
        });//用户token地址


        try {

          const tx = await program.methods
          .pledgeToken(pledge_amount)
          .accounts({
            user: user,//用户
            mint: mint,//初始化的token mint
            userToken: user_token,//用户token地址
            lpPool: lp_pool,//用户质押池
            pledgePool: pledge_pool,//质押池
            pledgeUser: pledge_user,//用户质押地址
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([])
          .rpc();

          console.log("Your transaction signature", tx);

          //update state
          let stakefinal = Number(stakeAmount);
          let poolfinal = Number(stakeAmount);

          if (stake && stake.tokenStaked && stake.tokenStaked !== "0") {
              stakefinal = stakefinal+Number(stake.tokenStaked);
          }

          if (pool && pool.tokenStaked && pool.tokenStaked !== "0") {
            poolfinal = poolfinal+Number(pool.tokenStaked);
          }

          setStake({tokenStaked:stakefinal.toString()});
          setPool({tokenStaked:poolfinal.toString()});


       } catch (error) {

         if (error instanceof AnchorError) {


           const code = error.error.errorCode.code ;
           const number = error.error.errorCode.number ;
            const  message = error.error.errorMessage;

           console.error('捕获到的错误: ', code,number,message);
           // 在这里处理错误，例如显示错误消息给用户
         } else {
           // 处理其他类型的错误
           console.error('未知错误: ', error);
         }
       }


  };

  const unStakeToken = async () => {
    const { program, provider,connection } = work;

    //console.log("Staking amount:", stakeAmount);
    // 添加你的质押逻辑
    const mint = new PublicKey(config.lpToken);//lptoken
          let amountValue = Number(stakeAmount);
         //判断代币是否存在
         try {

          const pay = await connection.getParsedAccountInfo(mint);

            const tokenData = pay.value.data.parsed.info;

            if(!tokenData.isInitialized){
              console.error('代币未初始化');
            }
            amountValue = amountValue * Math.pow(10, tokenData.decimals);
            const owner = provider.wallet.publicKey;
            console.log(tokenData);
            const userVault = associatedAddress({
                mint: mint,
                owner: owner
              });
              //console.log(userVault);

              const findAccountARes = await connection.getTokenAccountBalance(userVault);

              const findAccountValue = findAccountARes.value.amount;
              const intValue = parseInt(findAccountValue, 10);
              console.log(intValue)
              if(intValue<amountValue){
                console.error('余额不足');
              }

        } catch (error) {
          console.error('你还没有此代币');
        }

        const user = provider.wallet.publicKey;
        const lp_pool = PublicKey.findProgramAddressSync([Buffer.from("lp_pool"), mint.toBuffer()], program.programId)[0];//用户质押池
        const pledge_pool = PublicKey.findProgramAddressSync([Buffer.from("pledge_pool")], program.programId)[0];//质押池
        const pledge_user = PublicKey.findProgramAddressSync([user.toBuffer()], program.programId)[0];//用户质押地址
        const unpledge_amount = new BN(amountValue);//100 token 质押数量

        const user_token =  associatedAddress({
          mint: mint,
          owner: user
        });//用户token地址


        try {

          const tx = await program.methods
          .unpledgeToken(unpledge_amount)
          .accounts({
            user: user,
            mint: mint,
            userToken: user_token,
            lpPool: lp_pool,
            pledgePool: pledge_pool,
            pledgeUser: pledge_user,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([])
          .rpc();
          console.log("Your transaction signature", tx);

           //update state
           let stakefinal = Number(stakeAmount);
           let poolfinal = Number(stakeAmount);

           if (stake && stake.tokenStaked && stake.tokenStaked !== "0") {
               stakefinal = Number(stake.tokenStaked) - stakefinal;
           }

           if (pool && pool.tokenStaked && pool.tokenStaked !== "0") {
             poolfinal = Number(pool.tokenStaked) - poolfinal;
           }

           setStake({tokenStaked:stakefinal.toString()});
           setPool({tokenStaked:poolfinal.toString()});



       } catch (error) {

         if (error instanceof AnchorError) {


           const code = error.error.errorCode.code ;
           const number = error.error.errorCode.number ;
            const  message = error.error.errorMessage;

           console.error('捕获到的错误: ', code,number,message);
           // 在这里处理错误，例如显示错误消息给用户
         } else {
           // 处理其他类型的错误
           console.error('未知错误: ', error);
         }
       }


  };

  const view = async () => {
    const { program, provider,connection } = work;


    // 添加你的质押逻辑
    const mint = new PublicKey(config.lpToken);//lptoken

         //判断代币是否存在
         try {

          const pay = await connection.getParsedAccountInfo(mint);

            const tokenData = pay.value.data.parsed.info;

            if(!tokenData.isInitialized){
              console.error('代币未初始化');
            }

        } catch (error) {
          console.error('没有此代币');
        }




        try {
          const { program, provider } = work;
          const user = provider.wallet.publicKey;
          const pledge_user = PublicKey.findProgramAddressSync([user.toBuffer()], program.programId)[0];
          const pledge_pool = PublicKey.findProgramAddressSync([Buffer.from("pledge_pool")], program.programId)[0];
          const totalAccounts = await program.account.pledgePool.fetch(pledge_pool);
          console.log("totalAccounts", totalAccounts);
          const stakeInfoAccounts = await program.account.pledgeUser.fetch(pledge_user);
          console.log("stakeInfoAccounts", stakeInfoAccounts);

          const tokenAccRatio = totalAccounts.tokenAccRatio.toString();
          const nftAccRatio = totalAccounts.nftAccRatio.toString();



          let num = new BN(0);
          if (stakeInfoAccounts) {


            let tokenAmount = stakeInfoAccounts.nftAmount.toString();
            const tokenDebt = new BN(stakeInfoAccounts.tokenDebt);
            const tokenRemaining = new BN(stakeInfoAccounts.tokenRemaining);
            tokenAmount = safeMultiply(tokenAmount,tokenAccRatio);
            tokenAmount = tokenAmount.sub(tokenDebt);
            tokenAmount = tokenAmount.add(tokenRemaining);

            let nftAmount = stakeInfoAccounts.nftAmount.toString();
            const nftDebt = new BN(stakeInfoAccounts.nftDebt);
            const nftRemaining = new BN(stakeInfoAccounts.nftRemaining);
            nftAmount = safeMultiply(nftAmount,nftAccRatio);
            nftAmount = tokenAmount.sub(nftDebt);
            nftAmount = tokenAmount.add(nftRemaining);

            num = tokenAmount.add(nftAmount);

          }

          const num_string = num.toString();
          console.log(num_string);
          setEarn({num:num_string});


       } catch (error) {

         if (error instanceof AnchorError) {


           const code = error.error.errorCode.code ;
           const number = error.error.errorCode.number ;
            const  message = error.error.errorMessage;

           console.error('捕获到的错误: ', code,number,message);
           // 在这里处理错误，例如显示错误消息给用户
         } else {
           // 处理其他类型的错误
           console.error('未知错误: ', error);
         }
       }


  };



  const withdrew = async () => {
    const { program, provider,connection } = work;

    //console.log("Staking amount:", stakeAmount);
    // 添加你的质押逻辑
    const mint = new PublicKey(config.lpToken);//lptoken

         //判断代币是否存在
         try {

            const pay = await connection.getParsedAccountInfo(mint);

            const tokenData = pay.value.data.parsed.info;

            if(!tokenData.isInitialized){
              console.error('代币未初始化');
            }

        } catch (error) {
          console.error('没有此代币');
        }

        const user = provider.wallet.publicKey;
        const user_token =  associatedAddress({
          mint: mint,
          owner: user
        });
        const fund_pool = PublicKey.findProgramAddressSync([Buffer.from("fund_pool"), mint.toBuffer()], program.programId)[0];
        const pledge_pool = PublicKey.findProgramAddressSync([Buffer.from("pledge_pool")], program.programId)[0];
        const pledge_user = PublicKey.findProgramAddressSync([user.toBuffer()], program.programId)[0];

        try {
          const tx = await program.methods
            .drawProfit()
            .accounts({
                user: user,
                mint: mint,
                pledgePool: pledge_pool,
                pledgeUser: pledge_user,
                fundPool: fund_pool,
                userToken: user_token,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
            })
            .signers([])
            .rpc();
          console.log("Your transaction signature", tx);


       } catch (error) {

         if (error instanceof AnchorError) {


           const code = error.error.errorCode.code ;
           const number = error.error.errorCode.number ;
            const  message = error.error.errorMessage;

           console.error('捕获到的错误: ', code,number,message);
           // 在这里处理错误，例如显示错误消息给用户
         } else {
           // 处理其他类型的错误
           console.error('未知错误: ', error);
         }
       }


  };




  return (
    <div className="grid-width">
      <div className="lp-card">
        <div className="lp-h4">
          <div className="lp-h4-bar"></div>
          LP impawn
          <img src="../../../assets/audio.png" className="lp-h4-icon" alt="" />
        </div>
        <div className="lp-main">
          <div className="lp-text">Current LP：{stake?.tokenStaked}</div>
          <input
            type="text"
            className="lp-input"
            placeholder="Please enter the amount to Stake or UnStake"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
          />
          <div className="lp-footer">
            <div onClick={() => stakeSumbit()} className="lp-btn">Stake now</div>
            <div onClick={() => redeemSumbit()} className="lp-btn">Redeem</div>
          </div>
        </div>
      </div>

      <div className="lp-card">
        <div className="lp-h4">
          <div className="lp-h4-bar"></div>
          LP earnings
          <img src="../../../assets/audio.png" className="lp-h4-icon" alt="" />
        </div>
        <div className="lp-main2">
          <div className="lp-box-hd">
            Total LP of the whole network
            {pool?.tokenStaked && <div className="lp-box-hd-bar">{pool?.tokenStaked}</div>}
          </div>
          <div className="lp-box-bd">
            <div onClick={() => toggleBox1(true)} className="lp-box-btn">View revenue</div>
            <div onClick={() => withdrewSumbit()} className="lp-box-btn lp-box-btn-primary">Extract</div>
          </div>
        </div>
      </div>

      {showbox1 && (
        <Box1
          data={{
            //d: '100',
            a: '00000',
            b: 'Earn',
            //c: 'The current redemption amount',
            e: 'The current earn amount:',
            //f: 'The current redemption amount:',
          }}
          onOk={() => {
            toggleBox1(false);
            console.log('ok');
          }}
          onCancel={() => {
            toggleBox1(false);
            console.log('关闭');
          }}
        />
      )}
      {/* {showbox2 && (
        <Box2
          data={{
            d: '100',
            a: '1000',
            b: 'Redeem',
            c: 'Current staking LP',
            e: 'Current staking LP:',
            f: 'The current redemption amount:',
          }}
          onOk={() => {
            toggleBox2(false);
            console.log('ok');
          }}
          onCancel={() => {
            toggleBox2(false);
            console.log('关闭');
          }}
        />
      )} */}
    </div>
  );
}
