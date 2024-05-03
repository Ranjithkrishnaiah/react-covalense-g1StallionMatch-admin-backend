import { ViewEntity, ViewColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Horse } from '../horse.entity';

@ViewEntity({
  name: 'vwHorseAccuracyProfile',
})
export class HorseAccuracyProfileView {
  @ViewColumn()
  horseId: number;

  @ViewColumn()
  accuracyRating: string;

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'horseId', referencedColumnName: 'id' })
  horse: Horse;
}
