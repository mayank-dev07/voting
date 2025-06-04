import { BankrunProvider, startAnchor } from 'anchor-bankrun'
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Voting } from '../target/types/voting'

const IDL = require('../target/idl/voting.json')

const votingAddress = new PublicKey(IDL.address)

describe('voting', () => {
  it('initialize poll', async () => {
    const context = await startAnchor(
      '',
      [
        {
          name: 'voting',
          programId: votingAddress,
        },
      ],
      [],
    )

    const provider = new BankrunProvider(context)
    const votingProgram = new Program<Voting>(IDL, provider)

    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        new anchor.BN(0),
        new anchor.BN(1749047739),
        'who is the best player in the world?',
      )
      .rpc()
  })
})
