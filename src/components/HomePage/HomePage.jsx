import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import styles from './HomePage.module.css'
import { ethers } from 'ethers'

export default function HomePage() {
  const [errorMessage, setErrorMessage] = useState(null)
  const [defaultAccount, setDefaultAccount] = useState(null)
  const [userBalance, setUserBalance] = useState(null)
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [address3, setAddress3] = useState('')
  const [ether, setEther] = useState(0)

  // useEffect(() => {
  //   getUserBalance(defaultAccount)
  // }, [userBalance])

  const connectWalletHandler = () => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((result) => {
          accountChangedHandler(result[0])
        })
    } else {
      setErrorMessage('Install MetaMask')
      console.log(errorMessage)
    }
  }

  const accountChangedHandler = (newAccount) => {
    setDefaultAccount(newAccount)
    getUserBalance(newAccount.toString())
    console.log('defo', defaultAccount)
    console.log('balance', userBalance)
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

  const transactionHandler = async (ether, address1, address2) => {
    const params = {
      to: address1,
      value: ethers.utils.parseEther(ether),
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      await signer.sendTransaction({
        to: address1,
        value: ethers.utils.parseEther(ether),
      })
      if (address2) {
        await signer.sendTransaction({
          to: address2,
          value: ethers.utils.parseEther(ether),
        })
      }
      if (address3) {
        await signer.sendTransaction({
          to: address3,
          value: ethers.utils.parseEther(ether),
        })
      }
      console.log('ether', ether)
      console.log('address', address1)
      console.log('balance', userBalance)
      getUserBalance(defaultAccount)
    } catch (error) {
      setErrorMessage(error)
      console.log(error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await transactionHandler(ether, address1, address2, address3)
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
                placeholder="Address1"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" style={{ width: '50vw' }}>
              <Form.Control
                type="text"
                placeholder="Address2"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" style={{ width: '50vw' }}>
              <Form.Control
                type="text"
                placeholder="Address3"
                value={address3}
                onChange={(e) => setAddress3(e.target.value)}
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
    </div>
  )
}
