import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import './index.css'
import avatarIcon from './avatar.png'
import arrowDown from './arrow-down.png'

export const Header = () =>{
  return(
    <div className="header flex flex-row items-center">
      <div className="grid-width flex flex-row justify-between">
        <div className="header-avatar">
          <img className="header-avatar-icon" src={avatarIcon} alt=""/>
          <span className="header-name">Melic</span>
        </div>
        <div className="tool">
          <div className="tool-lange">
            EN
            <img src={arrowDown} className="tool-lange-icon" alt=""/>
          </div>
          <div className="tool-btn">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </div>
  )
} 