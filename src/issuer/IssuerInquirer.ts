import { clear } from 'console'
import { textSync } from 'figlet'
import { prompt } from 'inquirer'

import { BaseInquirer, ConfirmOptions } from '../BaseInquirer'
import { Issuer, RegistryOptions } from './Issuer'
import { Listener } from '../Listener'
import { Title } from '../OutputClass'

enum PromptOptions {
  CreateConnection = 'Create connection invitation',
  OfferCredential = 'Offer credential',
  RequestProof = 'Request proof',
  SendMessage = 'Send message',
  Exit = 'Exit',
  Restart = 'Restart',
}

export class IssuerInquirer extends BaseInquirer {
  public issuer: Issuer
  public promptOptionsString: string[]
  public listener: Listener

  public constructor(issuer: Issuer) {
    super()
    this.issuer = issuer
    this.listener = new Listener()
    this.promptOptionsString = Object.values(PromptOptions)
    this.listener.messageListener(this.issuer.agent, this.issuer.name)
  }

  public static async build(): Promise<IssuerInquirer> {
    const issuer = await Issuer.build()
    return new IssuerInquirer(issuer)
  }

  private async getPromptChoice() {
    if (this.issuer.outOfBandId) return prompt([this.inquireOptions(this.promptOptionsString)])

    const reducedOption = [PromptOptions.CreateConnection, PromptOptions.Exit, PromptOptions.Restart]
    return prompt([this.inquireOptions(reducedOption)])
  }

  public async processAnswer() {
    const choice = await this.getPromptChoice()
    if (this.listener.on) return

    switch (choice.options) {
      case PromptOptions.CreateConnection:
        await this.connection()
        break
      case PromptOptions.OfferCredential:
        await this.credential()
        return
      case PromptOptions.RequestProof:
        await this.proof()
        return
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

  public async connection() {
    await this.issuer.setupConnection()
  }

  public async exitUseCase(title: string) {
    const confirm = await prompt([this.inquireConfirmation(title)])
    if (confirm.options === ConfirmOptions.No) {
      return false
    } else if (confirm.options === ConfirmOptions.Yes) {
      return true
    }
  }

  public async credential() {
    const registry = await prompt([this.inquireOptions([RegistryOptions.indy, RegistryOptions.cheqd])])
    await this.issuer.importDid(registry.options)
    await this.issuer.issueCredential()
    const title = 'Is the credential offer accepted?'
    await this.listener.newAcceptedPrompt(title, this)
  }

  public async proof() {
    await this.issuer.sendProofRequest()
    const title = 'Is the proof request accepted?'
    await this.listener.newAcceptedPrompt(title, this)
  }

  public async message() {
    const message = await this.inquireMessage()
    if (!message) return

    await this.issuer.sendMessage(message)
  }

  public async exit() {
    const confirm = await prompt([this.inquireConfirmation(Title.ConfirmTitle)])
    if (confirm.options === ConfirmOptions.No) {
      return
    } else if (confirm.options === ConfirmOptions.Yes) {
      await this.issuer.exit()
    }
  }

  public async restart() {
    const confirm = await prompt([this.inquireConfirmation(Title.ConfirmTitle)])
    if (confirm.options === ConfirmOptions.No) {
      await this.processAnswer()
      return
    } else if (confirm.options === ConfirmOptions.Yes) {
      await this.issuer.restart()
      await runIssuer()
    }
  }
}

let issuerInst: IssuerInquirer;

export const runIssuer = async () => {
  clear()
  console.log(textSync('Issuer', { horizontalLayout: 'full' }))
  issuerInst = await IssuerInquirer.build()
  console.log('API List')
  console.log('POST /api/issuer/receiveConnectionIssuer');
  console.log('POST /api/issuer/sendMessageIssuer');
  console.log('POST /api/issuer/restartIssuer');
  console.log('POST /api/issuer/offercCredentialIssuer');
}

export const receiveConnectionRequestIssuer = async () => {
  await issuerInst.connection();
}

export const sendMessageRequestIssuer = async () => {
  await issuerInst.message();
}

export const requestProofIssuer = async () => {
  await issuerInst.proof();
}

export const offerCredentialIssuer = async () => {
  await issuerInst.credential();
}

export const restartRequestIssuer = async () => {
  await issuerInst.restart();
}