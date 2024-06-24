import React, { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Idl, Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import idl from './utils/idl.json'
import { config } from "./utils/config";

import { Connection, PublicKey } from "@solana/web3.js";


// 创建 WorkspaceContext
const WorkspaceContext = createContext<any>(null);

export const WorkspaceProvider = ({ children }:{ children: ReactNode }) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [workspace, setWorkspace] = useState<any>(null);

  useEffect(() => {
    if (wallet && connection && !workspace) {
      const provider = new AnchorProvider(connection, wallet, {})
      setProvider(provider);
      const programId = config.programId
      const program = new Program(idl as Idl,programId)
      setWorkspace({ wallet, connection, provider, program });
    }
  }, [wallet, connection, workspace]);

  console.log(wallet)

  if (!wallet) {
    return <div style={{
      display:'flex',
      width: '100vw',
      height: '100vh',
      justifyContent: 'center',
      alignItems: 'center'
    }}><WalletMultiButton/></div>
  }

  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
};

// 自定义 Hook 用于访问 WorkspaceContext
export const useWorkspace = () => {
  return useContext(WorkspaceContext);
};
