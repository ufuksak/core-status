import { Exclude } from "class-transformer";
import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {StreamEntity} from "./stream.entity";
import {UpdateMarkerInterface} from "../dto/status.model";

export const updateEntityName = "update";

@Entity({name: updateEntityName, synchronize: true})
export class UpdateEntity {
  @PrimaryColumn('uuid')
  id: string;

  @PrimaryColumn('uuid')
  stream_id: string;

  @Column({type: 'text', nullable: true})
  payload: string;

  @Column({type: 'timestamptz'})
  recorded_at: Date;

  @CreateDateColumn({type: 'timestamptz'})
  uploaded_at: Date;

  @Column('jsonb')
  marker: UpdateMarkerInterface;

  @Exclude()
  @ManyToOne(() => StreamEntity, stream => stream.updates, {
      onUpdate: 'CASCADE'
  })
  @JoinColumn({name: 'stream_id'})
  stream: StreamEntity;
}
