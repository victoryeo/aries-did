import type { Holder } from './holder/Holder'
import type { HolderInquirer } from './holder/HolderInquirer'
import type { Issuer } from './issuer/Issuer'
import type { IssuerInquirer } from './issuer/IssuerInquirer'
import type { Verifier } from './verifier/Verifier'
import type { VerifierInquirer } from './verifier/VerifierInquirer'
import type {
  Agent,
  BasicMessageStateChangedEvent,
  CredentialExchangeRecord,
  CredentialStateChangedEvent,
  ProofExchangeRecord,
  ProofStateChangedEvent,
} from '@credo-ts/core'
import type BottomBar from 'inquirer/lib/ui/bottom-bar'

import {
  BasicMessageEventTypes,
  BasicMessageRole,
  CredentialEventTypes,
  CredentialState,
  ProofEventTypes,
  ProofState,
} from '@credo-ts/core'
import { ui } from 'inquirer'

import { Color, purpleText } from './OutputClass'

export class Listener {
  public on: boolean
  private ui: BottomBar

  public constructor() {
    this.on = false
    this.ui = new ui.BottomBar()
  }

  private turnListenerOn() {
    this.on = true
  }

  private turnListenerOff() {
    this.on = false
  }

  private printCredentialAttributes(credentialRecord: CredentialExchangeRecord) {
    if (credentialRecord.credentialAttributes) {
      const attribute = credentialRecord.credentialAttributes
      console.log('\n\nCredential preview:')
      attribute.forEach((element) => {
        console.log(purpleText(`${element.name} ${Color.Reset}${element.value}`))
      })
    }
  }

  private async newCredentialPrompt(credentialRecord: CredentialExchangeRecord, HolderInquirer: HolderInquirer) {
    this.printCredentialAttributes(credentialRecord)
    this.turnListenerOn()
    await HolderInquirer.acceptCredentialOffer(credentialRecord)
    this.turnListenerOff()
    await HolderInquirer.processAnswer()
  }

  public credentialOfferListener(holder: Holder, holderInquirer: HolderInquirer) {
    holder.agent.events.on(
      CredentialEventTypes.CredentialStateChanged,
      async ({ payload }: CredentialStateChangedEvent) => {
        if (payload.credentialRecord.state === CredentialState.OfferReceived) {
          await this.newCredentialPrompt(payload.credentialRecord, holderInquirer)
        }
      }
    )
  }

  public messageListener(agent: Agent, name: string) {
    agent.events.on(BasicMessageEventTypes.BasicMessageStateChanged, async (event: BasicMessageStateChangedEvent) => {
      if (event.payload.basicMessageRecord.role === BasicMessageRole.Receiver) {
        this.ui.updateBottomBar(purpleText(`\n${name} received a message: ${event.payload.message.content}\n`))
      }
    })
  }

  private async newProofRequestPrompt(proofRecord: ProofExchangeRecord, holderInquirer: HolderInquirer) {
    this.turnListenerOn()
    await holderInquirer.acceptProofRequest(proofRecord)
    this.turnListenerOff()
    await holderInquirer.processAnswer()
  }

  public proofRequestListener(holder: Holder, holderInquirer: HolderInquirer) {
    holder.agent.events.on(ProofEventTypes.ProofStateChanged, async ({ payload }: ProofStateChangedEvent) => {
      if (payload.proofRecord.state === ProofState.RequestReceived) {
        await this.newProofRequestPrompt(payload.proofRecord, holderInquirer)
      }
    })
  }

  public proofAcceptedListener(issuer: Issuer, issuerInquirer: IssuerInquirer) {
    issuer.agent.events.on(ProofEventTypes.ProofStateChanged, async ({ payload }: ProofStateChangedEvent) => {
      if (payload.proofRecord.state === ProofState.Done) {
        await issuerInquirer.processAnswer()
      }
    })
  }

  public async newAcceptedPrompt(title: string, issuerInquirer: IssuerInquirer) {
    this.turnListenerOn()
    await issuerInquirer.exitUseCase(title)
    this.turnListenerOff()
    await issuerInquirer.processAnswer()
  }

  public async newAcceptedPromptVerifier(title: string, verifierInquirer: VerifierInquirer) {
    this.turnListenerOn()
    await verifierInquirer.exitUseCase(title)
    this.turnListenerOff()
    await verifierInquirer.processAnswer()
  }
}
