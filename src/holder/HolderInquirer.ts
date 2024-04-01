import type { CredentialExchangeRecord, ProofExchangeRecord } from '@credo-ts/core'

import { clear } from 'console'
import { textSync } from 'figlet'
import { prompt } from 'inquirer'

import { Holder } from './Holder'
import { BaseInquirer, ConfirmOptions } from '../BaseInquirer'
import { Listener } from '../Listener'
import { Title } from '../OutputClass'

enum PromptOptions {
  ReceiveConnectionUrl = 'Receive connection invitation',
  SendMessage = 'Send message',
  Exit = 'Exit',
  Restart = 'Restart',
}

export class HolderInquirer extends BaseInquirer {
  public holder: Holder
  public promptOptionsString: string[]
  public listener: Listener

  public constructor(holder: Holder) {
    super()
    this.holder = holder
    this.listener = new Listener()
    this.promptOptionsString = Object.values(PromptOptions)
    this.listener.messageListener(this.holder.agent, this.holder.name)
  }

  public static async build(): Promise<HolderInquirer> {
    const holder = await Holder.build()
    return new HolderInquirer(holder)
  }

  private async getPromptChoice() {
    if (this.holder.connectionRecordIssuerId) return prompt([this.inquireOptions(this.promptOptionsString)])

    const reducedOption = [PromptOptions.ReceiveConnectionUrl, PromptOptions.Exit, PromptOptions.Restart]
    return prompt([this.inquireOptions(reducedOption)])
  }

  public async processAnswer() {
    const choice = await this.getPromptChoice()
    if (this.listener.on) return

    switch (choice.options) {
      case PromptOptions.ReceiveConnectionUrl:
        await this.connection()
        break
      case PromptOptions.SendMessage:
        await this.message()
        break
      case PromptOptions.Exit:
        await this.exit()
        break
      case PromptOptions.Restart:
        await this.restart()
        return
    }
    await this.processAnswer()
  }

  public async acceptCredentialOffer(credentialRecord: CredentialExchangeRecord) {
    const confirm = await prompt([this.inquireConfirmation(Title.CredentialOfferTitle)])
    if (confirm.options === ConfirmOptions.No) {
      await this.holder.agent.credentials.declineOffer(credentialRecord.id)
    } else if (confirm.options === ConfirmOptions.Yes) {
      await this.holder.acceptCredentialOffer(credentialRecord)
    }
  }

  public async acceptProofRequest(proofRecord: ProofExchangeRecord) {
    const confirm = await prompt([this.inquireConfirmation(Title.ProofRequestTitle)])
    if (confirm.options === ConfirmOptions.No) {
      await this.holder.agent.proofs.declineRequest({ proofRecordId: proofRecord.id })
    } else if (confirm.options === ConfirmOptions.Yes) {
      await this.holder.acceptProofRequest(proofRecord)
    }
  }

  public async connection() {
    const title = Title.InvitationTitle
    const getUrl = await prompt([this.inquireInput(title)])
    await this.holder.acceptConnection(getUrl.input)
    if (!this.holder.connected) return

    this.listener.credentialOfferListener(this.holder, this)
    this.listener.proofRequestListener(this.holder, this)
  }

  public async message() {
    const message = await this.inquireMessage()
    if (!message) return

    await this.holder.sendMessage(message)
  }

  public async exit() {
    const confirm = await prompt([this.inquireConfirmation(Title.ConfirmTitle)])
    if (confirm.options === ConfirmOptions.No) {
      return
    } else if (confirm.options === ConfirmOptions.Yes) {
      await this.holder.exit()
    }
  }

  public async restart() {
    const confirm = await prompt([this.inquireConfirmation(Title.ConfirmTitle)])
    if (confirm.options === ConfirmOptions.No) {
      await this.processAnswer()
      return
    } else if (confirm.options === ConfirmOptions.Yes) {
      await this.holder.restart()
      await runHolder()
    }
  }
}

let HolderInst: HolderInquirer;

export const runHolder = async () => {
  clear()
  console.log(textSync('Holder', { horizontalLayout: 'full' }))
  HolderInst = await HolderInquirer.build()
  console.log('API List')
  console.log('POST /api/Holder/receiveConnectionHolder');
  console.log('POST /api/Holder/sendMessageHolder');
  console.log('POST /api/Holder/restartHolder');
}

export const receiveConnectionRequestHolder = async () => {
  await HolderInst.connection();
}

export const sendMessageRequestHolder = async () => {
  await HolderInst.message();
}

export const restartRequestHolder = async () => {
  await HolderInst.restart();
}