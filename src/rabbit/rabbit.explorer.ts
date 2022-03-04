import * as _ from 'reflect-metadata'
import { Injectable } from '@nestjs/common'
import { Controller } from '@nestjs/common/interfaces'
import { MetadataScanner, ModulesContainer } from '@nestjs/core'
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'
import { Module } from '@nestjs/core/injector/module'
import { RABBITMQ_SUBSCRIBER, RabbitSubscriberConfig, RabbitSubscriberMetadataConfiguration } from './rabbit.interfaces'

@Injectable()
export class SubscriberExplorer {
  constructor(private readonly modulesContainer: ModulesContainer, private readonly metadataScanner: MetadataScanner) {}

  public explore(): RabbitSubscriberMetadataConfiguration[] {
    const modules = [...this.modulesContainer.values()]
    const instanceWrappers = this.findControllers(modules)
    const subscribedHandlers = this.findSubscribedHandlers(instanceWrappers)

    return subscribedHandlers
  }

  private exploreMethodMetadata(_instance: unknown, instancePrototype: Record<string, unknown>, methodKey: string): RabbitSubscriberConfig | null {
    const targetHandler = <Controller>instancePrototype[methodKey]

    const handler = <RabbitSubscriberMetadataConfiguration | null>Reflect.getMetadata(RABBITMQ_SUBSCRIBER, targetHandler)
    if (handler == null) {
      return null
    }

    return handler
  }

  private findControllers(modules: Module[]): InstanceWrapper<Controller>[] {
    const controllersMap = modules.filter(({ controllers }) => controllers.size > 0).map(({ controllers }) => controllers)

    const instanceWrappers: InstanceWrapper<Controller>[] = []

    controllersMap.forEach(map => {
      const mapKeys = [...map.keys()]
      mapKeys.map(key => {
        const controllerInstance = map.get(key)
        if (controllerInstance !== undefined) {
          instanceWrappers.push(controllerInstance)
        }
      })
    })

    return instanceWrappers
  }

  private findSubscribedHandlers(instanceWrappers: InstanceWrapper<Controller>[]): RabbitSubscriberMetadataConfiguration[] {
    return <RabbitSubscriberMetadataConfiguration[]>instanceWrappers
      .map(({ instance }) => {
        const instancePrototype = <Record<string, unknown>>Object.getPrototypeOf(instance)

        return this.metadataScanner.scanFromPrototype(instance, instancePrototype, method => this.exploreMethodMetadata(instance, instancePrototype, method))
      })
      .reduce((prev, curr) => {
        return prev.concat(curr)
      })
  }
}
