import type { ExpoConfig } from '../entities/expo.entity'

export interface IExpoRepository {
  getConfig(): Promise<ExpoConfig>
}
