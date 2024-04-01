import type { ConnectionRecord, CredentialExchangeRecord, ProofExchangeRecord } from '@credo-ts/core'

import { BaseAgent } from '../BaseAgent'
import { greenText, Output, redText } from '../OutputClass'

export class Holder extends BaseAgent {
  public connected: boolean
  public connectionRecordIssuerId?: string

  public constructor(port: number, name: string) {
    super({ port, name })
    this.connected = false
  }

  public static async build(): Promise<Holder> {
    const holder = new Holder(9000, 'Holder')
    await holder.initializeAgent()
    return holder
  }

  private async getConnectionRecord() {
    if (!this.connectionRecordIssuerId) {
      throw Error(redText(Output.MissingConnectionRecord))
    }
    return await this.agent.connections.getById(this.connectionRecordIssuerId)
  }

  private async receiveConnectionRequest(invitationUrl: string) {
    const { connectionRecord } = await this.agent.oob.receiveInvitationFromUrl(invitationUrl)
    if (!connectionRecord) {
      throw new Error(redText(Output.NoConnectionRecordFromOutOfBand))
    }
    return connectionRecord
  }

  private async waitForConnection(connectionRecord: ConnectionRecord) {
    connectionRecord = await this.agent.connections.returnWhenIsConnected(connectionRecord.id)
    this.connected = true
    console.log(greenText(Output.ConnectionEstablished))
    return connectionRecord.id
  }

  public async acceptConnection(invitation_url: string) {
    const connectionRecord = await this.receiveConnectionRequest(invitation_url)
    this.connectionRecordIssuerId = await this.waitForConnection(connectionRecord)
  }

  public async acceptCredentialOffer(credentialRecord: CredentialExchangeRecord) {
    await this.agent.credentials.acceptOffer({
      credentialRecordId: credentialRecord.id,
    })
  }

  public async acceptProofRequest(proofRecord: ProofExchangeRecord) {
    const requestedCredentials = await this.agent.proofs.selectCredentialsForRequest({
      proofRecordId: proofRecord.id,
    })

    await this.agent.proofs.acceptRequest({
      proofRecordId: proofRecord.id,
      proofFormats: requestedCredentials.proofFormats,
    })
    console.log(greenText('\nProof request accepted!\n'))
  }

  public async sendMessage(message: string) {
    const connectionRecord = await this.getConnectionRecord()
    await this.agent.basicMessages.sendMessage(connectionRecord.id, message)
  }

  public async exit() {
    console.log(Output.Exit)
    await this.agent.shutdown()
    process.exit(0)
  }

  public async restart() {
    await this.agent.shutdown()
  }
}