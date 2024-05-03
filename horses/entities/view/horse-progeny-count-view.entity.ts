import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'vwHorseProgenyCount',
})
export class HorseProgenyCountView {
  @ViewColumn()
  sireId: number;

  @ViewColumn()
  damId: number;

  @ViewColumn()
  progenyCnt: number;
}
