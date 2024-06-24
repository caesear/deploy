import './index.css';
interface Data{
  a?: String
  b?: String
  c?: String
  d?: String
  e?: String
  f?: String
}
interface ChildComponentProps{
  onCancel?: Function
  onOk?: Function
  data?: Data
}

export function Reddem(props: ChildComponentProps){
  console.log(props)
  return (
    <div className="reddem">
      <div className="reddem-main">
        <img className="reddem-main-icon" src="../../../assets/cai.png" alt="" />
        <div className="reddem-name">{props?.data?.b}</div>
        <div className="reddem-text">{props?.data?.c}</div>
        <div className="reddem-footer">
          <div onClick={() =>{
            props.onCancel && props.onCancel()
          }} className="reddem-btn">Cancel</div>
          <div onClick={() =>{
            props.onOk && props.onOk()
          }} className="reddem-btn reddem-btn-ok">Redeem</div>
        </div>
      </div>
    </div>
  )
}

export function Box1(props: ChildComponentProps){
  return (
    <div className="reddem">
      <div className="reddem-main">
        <img className="reddem-main-icon" src="../../../assets/cai.png" alt="" />
        <div className="reddem-name">Redeem</div>
        <div className="reddem-dl">
          <div className="reddem-dt">{props?.data?.e}</div>
          <div className="reddem-dd">{props?.data?.a}</div>
        </div>
        <div className="reddem-footer">
          <div onClick={() =>{
            props.onCancel && props.onCancel()
          }} className="reddem-btn">Cancel</div>
          <div onClick={() =>{
            props.onOk && props.onOk()
          }} className="reddem-btn reddem-btn-ok">Redeem</div>
        </div>
      </div>
    </div>
  )
}

export function Box2(props: ChildComponentProps){
  return (
    <div className="reddem">
      <div className="reddem-main">
        <img className="reddem-main-icon" src="../../../assets/cai.png" alt="" />
        <div className="reddem-name">Redeem</div>

        <div className="reddem-dl">
          <div className="reddem-dt">{props?.data?.e}</div>
          <div className="reddem-dd">{props?.data?.a}</div>
        </div>
        <div className="reddem-dl">
          <div className="reddem-dt">{props?.data?.f}</div>
          <div className="reddem-dd">{props?.data?.d}</div>
        </div>
        <div className="reddem-footer">
          <div onClick={() =>{
            props.onCancel && props.onCancel()
          }} className="reddem-btn">Cancel</div>
          <div onClick={() =>{
            props.onOk && props.onOk()
          }} className="reddem-btn reddem-btn-ok">Redeem</div>
        </div>
      </div>
    </div>
  )
}
