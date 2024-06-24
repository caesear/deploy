import './index.css';
interface Data{
  a?: String
}
interface ChildComponentProps{
  onCancel?: Function
  data?: Data
}

export function Success(props: ChildComponentProps){
  return (
    <div className="reddem">
      <div className="success-main">
        <div className='message-header'>
          <img className='message-header-icon' src="../../assets/success-icon.png" alt="" />
          Success !
        </div>
        <div className='message-text'>Airdrop was successful.</div>
      </div>
    </div>
  )
}


export function Error(props: ChildComponentProps){
  return (
    <div className="reddem">
      <div className="error-main">
        <div className='message-header'>
          <img className='message-header-icon' src="../../assets/error-icon.png" alt="" />
          Error!
        </div>
        <div className='message-text'>You have exceeded the 2 airdropss limitin the past 1 hour(s)</div>
      </div>
    </div>
  )
}

export function Close(props: ChildComponentProps){
  return (
    <div className="reddem">
      <div className="close-main">
        <img className='close-icon' src="../../assets/close-icon.png" alt="" />
        <div className='close-text'>Sorry, your balance is insufficient</div>
        <div onClick={() =>{
          props.onCancel && props.onCancel()
        }} className='close-btn'>CLOSE</div>
      </div>
    </div>
  )
}