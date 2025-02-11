import { Controller, Get, Param, Delete, Post, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Controller('rabbitmq') // Utilisez un préfixe d'API pour une meilleure organisation
export class RabbitMQController {
  constructor(private readonly httpService: HttpService) {}

  private readonly RABBITMQ_URL = 'http://localhost:15672/api';
  private readonly CREDENTIALS = 'user:password'; // Remplacez par vos credentials

  /**
   * Récupère la liste des queues
   */
  @Get('queues')
  async getQueues() {
    const url = `${this.RABBITMQ_URL}/queues`;
    return this.proxyRequest(url);
  }

  /**
   * Récupère les détails d'une queue spécifique
   */
  @Get('queues/:vhost/:name')
  async getQueueDetails(
    @Param('vhost') vhost: string,
    @Param('name') name: string,
  ) {
    const encodedVhost = encodeURIComponent(vhost);
    const encodedName = encodeURIComponent(name);
    const url = `${this.RABBITMQ_URL}/queues/${encodedVhost}/${encodedName}`;
    return this.proxyRequest(url);
  }

  /**
   * Purge une queue (supprime tous les messages)
   */
  @Post('queues/:vhost/:name/purge')
  async purgeQueue(
    @Param('vhost') vhost: string,
    @Param('name') name: string,
  ) {
    const encodedVhost = encodeURIComponent(vhost);
    const encodedName = encodeURIComponent(name);
    const url = `${this.RABBITMQ_URL}/queues/${encodedVhost}/${encodedName}/contents`;

    try {
      const response = await firstValueFrom(
        this.httpService.delete(url, {
          headers: {
            Authorization: `Basic ${Buffer.from(this.CREDENTIALS).toString('base64')}`,
          },
        }),
      );
      return { success: true, message: 'Queue purged successfully', data: response.data };
    } catch (error) {
      this.handleError(error, 'Failed to purge queue');
    }
  }

  /**
   * Supprime une queue
   */
  @Delete('queues/:vhost/:name')
  async deleteQueue(
    @Param('vhost') vhost: string,
    @Param('name') name: string,
  ) {
    const encodedVhost = encodeURIComponent(vhost);
    const encodedName = encodeURIComponent(name);
    const url = `${this.RABBITMQ_URL}/queues/${encodedVhost}/${encodedName}`;

    try {
      const response = await firstValueFrom(
        this.httpService.delete(url, {
          headers: {
            Authorization: `Basic ${Buffer.from(this.CREDENTIALS).toString('base64')}`,
          },
        }),
      );
      return { success: true, message: 'Queue deleted successfully', data: response.data };
    } catch (error) {
      this.handleError(error, 'Failed to delete queue');
    }
  }

  /**
   * Méthode générique pour les requêtes GET
   */
  private async proxyRequest(url: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Basic ${Buffer.from(this.CREDENTIALS).toString('base64')}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch data from RabbitMQ');
    }
  }

  /**
   * Gestion centralisée des erreurs
   */
  private handleError(error: AxiosError, defaultMessage: string) {
    if (error.response) {
      throw new HttpException(
        {
          status: error.response.status,
          message: error.response.data || defaultMessage,
        },
        error.response.status,
      );
    } else {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: defaultMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
