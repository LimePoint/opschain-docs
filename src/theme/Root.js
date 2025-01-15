import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import Link from '@docusaurus/Link'
import useLocalStorage from 'use-local-storage'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import './Root.css'

export default function Root({children}) {
  const [eulaAgreed, setEulaAgreed] = useLocalStorage('eula-agreed', 'no')
  return <>
    <BrowserOnly fallback={<div className='popup-overlay' style={{ pointerEvents: 'none' }}></div>}>{() =>
      <Popup open={eulaAgreed === 'no'} modal closeOnDocumentClick={false} closeOnEscape={false} lockScroll={true}>
        <h3>LimePoint EULA</h3>
        <p>
          This website may only be used by you for the limited purpose of using LimePoint's products licenced to you and subject to LimePoint's standard <Link to='https://opschain.io/eula'>end user licence agreement (EULA)</Link> (or, if applicable, other terms agreed with LimePoint).
        </p>
        <button className='button button--primary button--lg' onClick={() => setEulaAgreed(new Date())}>
          Agree
        </button>
      </Popup>
    }</BrowserOnly>
    {children}
  </>
}
