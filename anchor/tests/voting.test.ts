import { BankrunProvider, startAnchor } from 'anchor-bankrun'
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Voting } from '../target/types/voting'

const IDL = require('../target/idl/voting.json')

const votingAddress = new PublicKey(IDL.address)

describe('voting', () => {
  let context
  let provider
  let votingProgram: Program<Voting>

  beforeAll(async () => {
    context = await startAnchor(
      '',
      [
        {
          name: 'voting',
          programId: votingAddress,
        },
      ],
      [],
    )

    provider = new BankrunProvider(context)
    votingProgram = new Program<Voting>(IDL, provider)
  })

  it('initialize poll', async () => {
    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        new anchor.BN(0),
        new anchor.BN(1749047739),
        'who is the best player in the world?',
      )
      .rpc()

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress)
    console.log(poll)

    expect(poll.pollId.toNumber()).toEqual(1)
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber())
    expect(poll.description).toEqual('who is the best player in the world?')
  })

  it('initialize candidate', async () => {
    await votingProgram.methods.initializeCandidate('messi', new anchor.BN(1)).rpc()
    await votingProgram.methods.initializeCandidate('ronaldo', new anchor.BN(1)).rpc()

    const [candidateAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('messi')],
      votingAddress,
    )
    const candidate = await votingProgram.account.candidate.fetch(candidateAddress)
    console.log(candidate)

    expect(candidate.candidateName).toEqual('messi')
    expect(candidate.candidateVotes.toNumber()).toEqual(0)
  })

  it('vote', async () => {
    await votingProgram.methods.vote('messi', new anchor.BN(1)).rpc()

    const [candidateAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('messi')],
      votingAddress,
    )

    const candidate = await votingProgram.account.candidate.fetch(candidateAddress)
    console.log(candidate)
    expect(candidate.candidateVotes.toNumber()).toEqual(1)
  })
})
