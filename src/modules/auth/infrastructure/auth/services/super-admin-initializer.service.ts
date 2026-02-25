import { Injectable, OnModuleInit } from '@nestjs/common';
import { EnsureSuperAdminUseCase } from '../../../application/use-cases/ensure-super-admin.use-case';

@Injectable()
export class SuperAdminInitializerService implements OnModuleInit {
  constructor(private readonly ensureSuperAdminUseCase: EnsureSuperAdminUseCase) {}

  async onModuleInit(): Promise<void> {
    await this.ensureSuperAdminUseCase.execute();
  }
}

