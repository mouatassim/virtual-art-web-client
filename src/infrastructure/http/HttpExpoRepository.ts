import { http } from './HttpClient'
import type { IExpoRepository } from '@core/repositories/expo.repository'
import type { ExpoConfig } from '@core/entities/expo.entity'

export class HttpExpoRepository implements IExpoRepository {
  async getConfig(): Promise<ExpoConfig> {
    const { config } = await http.get<{ config: ExpoConfig }>('/expos/published')
    return config
  }
}

export const httpExpoRepository: IExpoRepository = new HttpExpoRepository()
