import { Horse } from 'src/horses/entities/horse.entity';
import { ViewEntity, ViewColumn, ManyToOne, JoinColumn } from 'typeorm';

@ViewEntity({
  name: 'vwRunnerAccuracyProfile',
})
export class RunnerAccuracyProfileView {
  @ViewColumn()
  horseId: number;

  @ViewColumn()
  accuracyRating: string;

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'horseId', referencedColumnName: 'id' })
  horse: Horse;
}
