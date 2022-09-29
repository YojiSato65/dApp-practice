import React, { useState, useEffect } from 'react'
import { Form, Button, Modal } from 'react-bootstrap'
import styles from './HomePage.module.css'
import { ethers } from 'ethers'

export default function HomePage() {
  const [defaultAccount, setDefaultAccount] = useState(null)
  const [userBalance, setUserBalance] = useState(null)
  const [addressesInput, setAddressesInput] = useState('')
  const [ether, setEther] = useState(0)
  const [balanceRefresh, setBalanceRefresh] = useState(0)
  const [addresses, setAddresses] = useState([])
  const [show, setShow] = useState(false)
  const [statuses, setStatuses] = useState([])
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

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
    try {
      const addresses = addressesInput.split(/\r?\n/)
      setAddresses(addresses)
      console.log('addresses', addresses)
      setStatuses(addresses.map((address) => 'waiting'))
      console.log('statuses', statuses)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const txs = []

      const eachTx = async (address, i) => {
        try {
          const tx = await signer.sendTransaction({
            to: address,
            value: ethers.utils.parseEther(ether).div(addresses.length),
          })
          setStatuses((statuses) =>
            statuses.map((status, index) => (i === index ? 'sent' : status)),
          )
          await tx.wait()
          setStatuses((statuses) =>
            statuses.map((status, index) => (i === index ? 'mined' : status)),
          )
        } catch (error) {
          console.log(error)
          setStatuses((statuses) =>
            statuses.map((status, index) =>
              i === index ? 'rejected' : status,
            ),
          )
        }
      }
      for (let i = 0; i < addresses.length; i++) {
        txs.push(eachTx(addresses[i], i))
      }
      await Promise.all(txs)
      handleClose()
      refreshDataGrid()
    } catch (error) {
      console.error(error)
    }
  }

  // const addresses = addressesInput.split(/\r?\n/)
  // setAddresses(addresses)
  // tx1 = {address:'', status:''}
  // setTx([tx1, tx2, ...])
  // const provider = new ethers.providers.Web3Provider(window.ethereum)
  // const signer = provider.getSigner()
  // const txs = []
  // for (const address of addresses) {
  //   const tx = signer
  //     .sendTransaction({
  //       to: address,
  //       value: ethers.utils.parseEther(ether).div(addresses.length),
  //     })
  // .then(async (result) => {
  //   setIsPendingByUser(false)
  //   setIsPendingByMiner(true)
  //   await result.wait()
  //   console.log('result', result)
  //   console.log('result wait', await result.wait())
  // })
  //     .then(() => {
  //       setIsPendingByMiner(false)
  //       setIsTxComplete(true)
  //     })
  //     .catch((e) => {
  //       console.log(e)
  //       if (e.code === 'ACTION_REJECTED') {
  //         setIsPendingByMiner(false)
  //         setIsTxRejected(true)
  //       }
  //     })
  //   txs.push(tx)
  // }
  // await Promise.allSettled(txs).then(() => {
  //   handleClose()
  //   console.log('txs', txs)
  //   refreshDataGrid()
  // })

  const handleSubmit = async (e) => {
    e.preventDefault()
    handleShow()
    await transactionHandler(ether, addressesInput)
  }

  const refreshDataGrid = () => setBalanceRefresh((b) => ++b)

  return (
    <div className={styles.container}>
      {defaultAccount ? (
        <>
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
              Send Transaction
            </Button>
          </Form>
        </>
      ) : (
        <Button onClick={connectWalletHandler}>Connect Wallet</Button>
      )}

      <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Complete transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {addresses.map((address, i) => (
            <div
              style={{ display: 'flex', justifyContent: 'space-between' }}
              key={i}
            >
              <p>{`To: ${address}`}</p>
              <p>{(ether / addresses.length).toFixed(3)} ETH</p>
              <p>{statuses[i]}</p>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer
          style={{ alignItems: 'flex-start', flexDirection: 'column' }}
        >
          <h5>You'll be asked to confirm this transaction from your wallet.</h5>
          {/* <Button variant="secondary" size="lg" disabled>
            Waiting for approval...
          </Button> */}
        </Modal.Footer>
        {/* <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer> */}
      </Modal>
    </div>
  )
}
