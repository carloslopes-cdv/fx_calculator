import { ValueTransformer } from 'typeorm';

export class NumericColumnTransformer implements ValueTransformer {
  to(data: number | null): number | null {
    return data;
  }

  from(data: string | null): number | null {
    if (data === null || data === undefined) {
      return null;
    }
    return parseFloat(data);
  }
}
