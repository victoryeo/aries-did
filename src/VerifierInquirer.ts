import { clear } from 'console'
import { textSync } from 'figlet'
import { prompt } from 'inquirer'

import { BaseInquirer, ConfirmOptions } from './BaseInquirer'
import { Verifier, RegistryOptions } from './Verifier'
import { Listener } from './Listener'
import { Title } from './OutputClass'

enum PromptOptions {
  CreateConnection = 'Create connection invitation',
  RequestProof = 'Request proof',
  SendMessage = 'Send message',
  Exit = 'Exit',
  Restart = 'Restart',
}

export class VerifierInquirer extends BaseInquirer {
  public verifier: Verifier
  public promptOptionsString: string[]
  public listener: Listener

  public constructor(verifier: Verifier) {
    super()
    this.verifier = verifier
    this.listener = new Listener()
    this.promptOptionsString = Object.values(PromptOptions)
    this.listener.messageListener(this.verifier.agent, this.verifier.name)
  }

  public static async build(): Promise<VerifierInquirer> {
    const verifier = await Verifier.build()
    return new VerifierInquirer(verifier)
  }

  private async getPromptChoice() {
    if (this.verifier.outOfBandId) return prompt([this.inquireOptions(this.promptOptionsString)])

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
    await this.verifier.setupConnection()
  }

  public async exitUseCase(title: string) {
    const confirm = await prompt([this.inquireConfirmation(title)])
    if (confirm.options === ConfirmOptions.No) {
      return false
    } else if (confirm.options === ConfirmOptions.Yes) {
      return true
    }
  }

  public async proof() {
    await this.verifier.sendProofRequest()
    const title = 'Is the proof request accepted?'
    await this.listener.newAcceptedPromptVerifier(title, this)
  }

  public async message() {
    const message = await this.inquireMessage()
    if (!message) return

    await this.verifier.sendMessage(message)
  }

  public async exit() {
    const confirm = await prompt([this.inquireConfirmation(Title.ConfirmTitle)])
    if (confirm.options === ConfirmOptions.No) {
      return
    } else if (confirm.options === ConfirmOptions.Yes) {
      await this.verifier.exit()
    }
  }

  public async restart() {
    const confirm = await prompt([this.inquireConfirmation(Title.ConfirmTitle)])
    if (confirm.options === ConfirmOptions.No) {
      await this.processAnswer()
      return
    } else if (confirm.options === ConfirmOptions.Yes) {
      await this.verifier.restart()
      await runVerifier()
    }
  }
}

let verifierInst: VerifierInquirer;

export const runVerifier = async () => {
  clear()
  console.log(textSync('verifier', { horizontalLayout: 'full' }))
  verifierInst = await VerifierInquirer.build()
  console.log('API List')
  console.log('POST /api/verifier/receiveConnectionverifier');
  console.log('POST /api/verifier/sendMessageverifier');
  console.log('POST /api/verifier/restartverifier');
  console.log('POST /api/verifier/requestProofverifier');
}

export const receiveConnectionRequestVerifier = async () => {
  await verifierInst.connection();
}

export const sendMessageRequestVerifier = async () => {
  await verifierInst.message();
}

export const requestProofVerifier = async () => {
  await verifierInst.proof();
}

export const restartRequestVerifier = async () => {
  await verifierInst.restart();
}