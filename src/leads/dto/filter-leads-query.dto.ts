import { IsOptional, IsString, IsNumberString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterLeadsQueryDto {
  @IsOptional()
  @IsNumberString()
  userId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }): string | string[] => {
    if (typeof value === 'string') {
      return value.split(',').map((s) => s.trim());
    }
    return value as string | string[];
  })
  @IsIn(['open', 'closed'], {
    each: true,
  })
  status?: string | string[];
}
