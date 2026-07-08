import { expo } from '../../config/expo.config'
import type { IExpoRepository } from '../../core/repositories/expo.repository'
import type { ExpoConfig } from '../../core/entities/expo.entity'

export class MockExpoRepository implements IExpoRepository {
  async getConfig(): Promise<ExpoConfig> {
    return expo
  }
}

export const expoRepository: IExpoRepository = new MockExpoRepository()
