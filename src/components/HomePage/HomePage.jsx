import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import styles from './HomePage.module.css'
import { ethers } from 'ethers'

export default function HomePage() {
  const [errorMessage, setErrorMessage] = useState(null)
  const [defaultAccount, setDefaultAccount] = useState(null)
  const [userBalance, setUserBalance] = useState(null)
  const [address, setAddress] = useState('')
  const [ether, setEther] = useState(0)

  const connectWalletHandler = () => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((result) => {
          accountChangedHandler(result[0])
        })
    } else {
      setErrorMessage('Install MetaMask')
    }
  }

  const accountChangedHandler = (newAccount) => {
    setDefaultAccount(newAccount)
    getUserBalance(newAccount.toString())
  }

  const getUserBalance = (address) => {
    window.ethereum
      .request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      })
      .then((balance) => {
        setUserBalance(ethers.utils.formatEther(balance))
      })
  }

  const chainChangedHandler = () => {
    window.location.reload()
  }

  window.ethereum.on('accountsChanged', accountChangedHandler)

  window.ethereum.on('chainChanged', chainChangedHandler)

  const transactionHandler = async (ether, address) => {
    try {
      const result = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      ethers.utils.getAddress(address)
      const transaction = await signer.sendTransaction({
        to: address,
        value: ethers.utils.parseEther(ether),
      })
      console.log('result', result)
      console.log(ether, address)
      console.log('tx', transaction)
      accountChangedHandler(result)
      console.log('userBalance', userBalance)
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await transactionHandler(ether, address)
  }

  return (
    <div className={styles.container}>
      {defaultAccount ? (
        <div>
          <h3>Address: {defaultAccount}</h3>
          <h3>Balance: {userBalance}</h3>
          <Form
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '50px',
            }}
            onSubmit={handleSubmit}
          >
            <Form.Group className="mb-3" style={{ width: '50vw' }}>
              <Form.Control
                type="number"
                placeholder="Amount"
                value={ether}
                onChange={(e) => setEther(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" style={{ width: '50vw' }}>
              <Form.Control
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </div>
      ) : (
        <Button onClick={connectWalletHandler}>Connect Wallet</Button>
      )}

      {errorMessage}
    </div>
  )
}
