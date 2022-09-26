import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import styles from './HomePage.module.css'
import { ethers } from 'ethers'

export default function HomePage() {
  const [defaultAccount, setDefaultAccount] = useState(null)
  const [userBalance, setUserBalance] = useState(null)
  const [addressesInput, setAddressesInput] = useState('')
  const [ether, setEther] = useState(0)
  const [balanceRefresh, setBalanceRefresh] = useState(0)

  useEffect(() => {
    console.log('update the balance')
    getUserBalance(defaultAccount)
  }, [balanceRefresh])

  const connectWalletHandler = async () => {
    if (window.ethereum) {
      const result = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      accountChangedHandler(result[0])
    } else {
      console.log('install metamask')
    }
  }

  const accountChangedHandler = (newAccount) => {
    setDefaultAccount(newAccount)
    getUserBalance(newAccount.toString())
    // console.log('defo', defaultAccount)
    // console.log('balance', userBalance)
  }

  const getUserBalance = async (address) => {
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    })
    setUserBalance(ethers.utils.formatEther(balance))
  }

  const chainChangedHandler = () => {
    window.location.reload()
  }
  window.ethereum.on('accountsChanged', accountChangedHandler)
  window.ethereum.on('chainChanged', chainChangedHandler)

  // addresses
  // account1: 0xa3123e1D8A7EA78608776cF8b083E68b58FbF4d3
  // account2: 0xd236bBcca49eeA2eBAbf1eD6622c4fBD1E652240
  // account3: 0xF92aAB15Cf45d6b161aC74Ac001a6D30e98C3236
  const transactionHandler = async (ether, addressesInput) => {
    const addresses = addressesInput.split(/\r?\n/)
    console.log('addresses', addresses)
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const txs = []
    for (const address of addresses) {
      const tx = signer.sendTransaction({
        to: address,
        value: ethers.utils.parseEther(ether).div(addresses.length),
      })
      txs.push(tx)
    }
    console.log('txs:', txs)

    const response = await Promise.allSettled(txs)
      .then(async (results) => {
        console.log('results', results)
        for (let i = 0; i < results.length; i++) {
          if (results[i].status === 'fulfilled') {
            await results[i].value.wait()
          } else {
            console.log(`promise${i + 1} rejected`)
          }
        }
      })
      .catch((e) => {
        console.log(e)
      })
    refreshDataGrid()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await transactionHandler(ether, addressesInput)
  }

  const refreshDataGrid = () => setBalanceRefresh((b) => ++b)

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
                as="textarea"
                rows={5}
                placeholder="Enter the addresses devided by new lines"
                value={addressesInput}
                onChange={(e) => setAddressesInput(e.target.value)}
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
