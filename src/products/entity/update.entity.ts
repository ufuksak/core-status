import { Exclude } from "class-transformer";
import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {StreamEntity} from "./stream.entity";

@Entity({name: "update", synchronize: true})
export class UpdateEntity {
  @PrimaryColumn('uuid')
  id: string;

  @PrimaryColumn('uuid')
  stream_id: string;

  @Column({type: 'text'})
  payload: string;

  @Column({type: 'timestamptz'})
  recorded_at: string;

  @CreateDateColumn({type: 'timestamptz'})
  uploaded_at: string;

  @Exclude()
  @ManyToOne(() => StreamEntity, stream => stream.updates, {
      onUpdate: 'CASCADE'
  })
  @JoinColumn({name: 'stream_id'})
  stream: StreamEntity;
}
